package com.smartcampus.integration;

import com.smartcampus.config.EmbeddedMongoConfig;
import com.smartcampus.config.TestSecurityConfig;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.context.annotation.Import;
import org.springframework.test.context.ActiveProfiles;

/**
 * Base class for integration tests.
 *
 * Uses Flapdoodle Embedded MongoDB — no Docker required.
 * Spring Boot auto-detects the Flapdoodle dependency on the test classpath and
 * starts an in-process MongoDB automatically.
 *
 * Security filters are disabled so tests can call API endpoints directly.
 */
@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc(addFilters = false)
@ActiveProfiles("test")
@Import({TestSecurityConfig.class, EmbeddedMongoConfig.class})
public abstract class BaseIntegrationTest {

    // Shared common setup for integration tests
}
