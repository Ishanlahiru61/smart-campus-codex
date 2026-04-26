package com.smartcampus.analytics.controller;

import com.smartcampus.analytics.dto.BookingTrendDTO;
import com.smartcampus.analytics.dto.PeakHourDTO;
import com.smartcampus.analytics.dto.TopResourceDTO;
import com.smartcampus.analytics.service.AnalyticsService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/admin/analytics")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminAnalyticsController {

    private final AnalyticsService analyticsService;

    @GetMapping("/top-resources")
    public ResponseEntity<List<TopResourceDTO>> getTopResources() {
        return ResponseEntity.ok(analyticsService.getTopResources());
    }

    @GetMapping("/peak-hours")
    public ResponseEntity<List<PeakHourDTO>> getPeakHours() {
        return ResponseEntity.ok(analyticsService.getPeakHours());
    }

    @GetMapping("/booking-trends")
    public ResponseEntity<List<BookingTrendDTO>> getBookingTrends() {
        return ResponseEntity.ok(analyticsService.getBookingTrends());
    }
}
