package com.smartcampus.util;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.fasterxml.jackson.databind.SerializationFeature;
import org.w3c.dom.Document;
import org.w3c.dom.Element;
import org.w3c.dom.Node;
import org.w3c.dom.NodeList;

import javax.xml.parsers.DocumentBuilder;
import javax.xml.parsers.DocumentBuilderFactory;
import java.io.File;
import java.time.Instant;
import java.util.HashMap;
import java.util.Map;

public class CoverageReportGenerator {

    private static final String JACOCO_XML_PATH = "target/site/jacoco/jacoco.xml";
    private static final String SUREFIRE_REPORTS_DIR = "target/surefire-reports";
    private static final String OUTPUT_JSON_PATH = "target/test-coverage-report.json";

    public static void main(String[] args) {
        try {
            System.out.println("[CoverageReport] Starting report generation...");

            Map<String, ModuleStats> modules = new HashMap<>();
            String[] targetModules = {"auth", "booking", "facility", "incident", "notification"};
            for (String mod : targetModules) {
                modules.put(mod, new ModuleStats());
            }

            // 1. Parse JaCoCo Report
            File jacocoFile = new File(JACOCO_XML_PATH);
            if (jacocoFile.exists()) {
                parseJacocoReport(jacocoFile, modules);
            } else {
                System.err.println("[CoverageReport] jacoco.xml not found at " + JACOCO_XML_PATH);
            }

            // 2. Parse Surefire Reports
            File surefireDir = new File(SUREFIRE_REPORTS_DIR);
            int totalTests = 0;
            int totalPassed = 0;
            int totalFailed = 0;
            int totalSkipped = 0;

            if (surefireDir.exists() && surefireDir.isDirectory()) {
                File[] xmlFiles = surefireDir.listFiles((dir, name) -> name.startsWith("TEST-") && name.endsWith(".xml"));
                if (xmlFiles != null) {
                    for (File xml : xmlFiles) {
                        TestResult result = parseSurefireXml(xml, modules);
                        totalTests += result.tests;
                        totalFailed += result.failures + result.errors;
                        totalSkipped += result.skipped;
                        totalPassed += (result.tests - result.failures - result.errors - result.skipped);
                    }
                }
            } else {
                System.err.println("[CoverageReport] surefire directory not found at " + SUREFIRE_REPORTS_DIR);
            }

            // Calculate overall coverage
            int totalMissed = 0;
            int totalCovered = 0;
            for (ModuleStats stats : modules.values()) {
                totalMissed += stats.missedInstructions;
                totalCovered += stats.coveredInstructions;
            }
            double overallCoverage = 0.0;
            if ((totalMissed + totalCovered) > 0) {
                overallCoverage = (double) totalCovered / (totalMissed + totalCovered) * 100.0;
            }

            // 3. Build JSON Output
            Map<String, Object> report = new HashMap<>();
            report.put("project", "Smart Campus Backend");

            Map<String, Object> summary = new HashMap<>();
            summary.put("totalTests", totalTests);
            summary.put("passed", totalPassed);
            summary.put("failed", totalFailed);
            summary.put("skipped", totalSkipped);
            summary.put("overallCoverage", Math.round(overallCoverage * 10.0) / 10.0);
            report.put("summary", summary);

            Map<String, Object> modulesJson = new HashMap<>();
            for (Map.Entry<String, ModuleStats> entry : modules.entrySet()) {
                Map<String, Object> modJson = new HashMap<>();
                modJson.put("tests", entry.getValue().tests);
                double modCov = 0.0;
                int modTotal = entry.getValue().coveredInstructions + entry.getValue().missedInstructions;
                if (modTotal > 0) {
                    modCov = (double) entry.getValue().coveredInstructions / modTotal * 100.0;
                }
                modJson.put("coverage", Math.round(modCov * 10.0) / 10.0);
                modulesJson.put(entry.getKey(), modJson);
            }
            report.put("modules", modulesJson);
            report.put("generatedAt", Instant.now().toString());

            // Write JSON
            ObjectMapper mapper = new ObjectMapper();
            mapper.enable(SerializationFeature.INDENT_OUTPUT);
            mapper.writeValue(new File(OUTPUT_JSON_PATH), report);

            System.out.println("[CoverageReport] JSON report generated: " + OUTPUT_JSON_PATH);

        } catch (Exception e) {
            e.printStackTrace();
            System.err.println("[CoverageReport] Failed to generate report: " + e.getMessage());
        }
    }

    private static void parseJacocoReport(File file, Map<String, ModuleStats> modules) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        dbf.setFeature("http://apache.org/xml/features/nonvalidating/load-external-dtd", false);
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(file);
        doc.getDocumentElement().normalize();

        NodeList packageNodes = doc.getElementsByTagName("package");
        for (int i = 0; i < packageNodes.getLength(); i++) {
            Node pkgNode = packageNodes.item(i);
            if (pkgNode.getNodeType() == Node.ELEMENT_NODE) {
                Element pkgEl = (Element) pkgNode;
                String name = pkgEl.getAttribute("name"); // e.g. com/smartcampus/auth/controller

                String moduleName = extractModuleFromName(name.replace("/", "."));
                if (moduleName != null && modules.containsKey(moduleName)) {
                    NodeList counters = pkgEl.getElementsByTagName("counter");
                    for (int j = 0; j < counters.getLength(); j++) {
                        Node counterNode = counters.item(j);
                        if (counterNode.getNodeType() == Node.ELEMENT_NODE) {
                            Element counterEl = (Element) counterNode;
                            if ("INSTRUCTION".equals(counterEl.getAttribute("type"))) {
                                int missed = Integer.parseInt(counterEl.getAttribute("missed"));
                                int covered = Integer.parseInt(counterEl.getAttribute("covered"));
                                modules.get(moduleName).missedInstructions += missed;
                                modules.get(moduleName).coveredInstructions += covered;
                            }
                        }
                    }
                }
            }
        }
    }

    private static TestResult parseSurefireXml(File file, Map<String, ModuleStats> modules) throws Exception {
        DocumentBuilderFactory dbf = DocumentBuilderFactory.newInstance();
        DocumentBuilder db = dbf.newDocumentBuilder();
        Document doc = db.parse(file);
        doc.getDocumentElement().normalize();

        Element testsuite = doc.getDocumentElement();
        int tests = Integer.parseInt(testsuite.getAttribute("tests"));
        int failures = Integer.parseInt(testsuite.getAttribute("failures"));
        int errors = Integer.parseInt(testsuite.getAttribute("errors"));
        int skipped = Integer.parseInt(testsuite.getAttribute("skipped"));

        String name = testsuite.getAttribute("name"); // e.g. com.smartcampus.auth.controller.AuthControllerTest
        String moduleName = extractModuleFromName(name);
        
        if (moduleName != null && modules.containsKey(moduleName)) {
            modules.get(moduleName).tests += tests;
        }

        TestResult result = new TestResult();
        result.tests = tests;
        result.failures = failures;
        result.errors = errors;
        result.skipped = skipped;
        return result;
    }

    private static String extractModuleFromName(String fullName) {
        if (fullName.contains("com.smartcampus.auth") || fullName.contains("com/smartcampus/auth")) return "auth";
        if (fullName.contains("com.smartcampus.booking") || fullName.contains("com/smartcampus/booking")) return "booking";
        if (fullName.contains("com.smartcampus.facility") || fullName.contains("com/smartcampus/facility")) return "facility";
        if (fullName.contains("com.smartcampus.incident") || fullName.contains("com/smartcampus/incident")) return "incident";
        if (fullName.contains("com.smartcampus.notification") || fullName.contains("com/smartcampus/notification")) return "notification";
        return null;
    }

    private static class ModuleStats {
        int tests = 0;
        int missedInstructions = 0;
        int coveredInstructions = 0;
    }

    private static class TestResult {
        int tests;
        int failures;
        int errors;
        int skipped;
    }
}
