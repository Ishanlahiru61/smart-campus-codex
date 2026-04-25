package com.smartcampus.analytics.service;

import com.smartcampus.analytics.dto.BookingTrendDTO;
import com.smartcampus.analytics.dto.PeakHourDTO;
import com.smartcampus.analytics.dto.TopResourceDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnalyticsService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    public List<TopResourceDTO> getTopResources() {
        List<Booking> allBookings = getRecentBookings();
        
        // Count bookings per resourceId
        Map<String, Long> countMap = allBookings.stream()
                .filter(b -> b.getResourceId() != null)
                .collect(Collectors.groupingBy(Booking::getResourceId, Collectors.counting()));
                
        // Sort by count descending and get top 10
        List<Map.Entry<String, Long>> topEntries = countMap.entrySet().stream()
                .sorted((e1, e2) -> Long.compare(e2.getValue(), e1.getValue()))
                .limit(10)
                .toList();

        return topEntries.stream().map(entry -> {
            String facilityId = entry.getKey();
            String facilityName = facilityRepository.findById(facilityId)
                    .map(Facility::getName)
                    .orElse("Unknown Facility");
            return TopResourceDTO.builder()
                    .facilityId(facilityId)
                    .facilityName(facilityName)
                    .totalBookings(entry.getValue())
                    .build();
        }).toList();
    }

    public List<PeakHourDTO> getPeakHours() {
        List<Booking> allBookings = getRecentBookings();

        Map<Integer, Long> hourCounts = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().getHour(), Collectors.counting()));

        return hourCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> {
                    String hourStr = String.format("%02d:00", entry.getKey());
                    return PeakHourDTO.builder()
                            .hour(hourStr)
                            .bookingCount(entry.getValue())
                            .build();
                })
                .toList();
    }

    public List<BookingTrendDTO> getBookingTrends() {
        List<Booking> allBookings = getRecentBookings();

        Map<LocalDate, Long> trendCounts = allBookings.stream()
                .filter(b -> b.getStartTime() != null)
                .collect(Collectors.groupingBy(b -> b.getStartTime().toLocalDate(), Collectors.counting()));

        return trendCounts.entrySet().stream()
                .sorted(Map.Entry.comparingByKey())
                .map(entry -> BookingTrendDTO.builder()
                        .date(entry.getKey().toString())
                        .count(entry.getValue())
                        .build())
                .toList();
    }

    private List<Booking> getRecentBookings() {
        LocalDateTime oneMonthAgo = LocalDateTime.now().minusMonths(1);
        return bookingRepository.findAll().stream()
                .filter(b -> b.getStartTime() != null && b.getStartTime().isAfter(oneMonthAgo))
                .toList();
    }
}
