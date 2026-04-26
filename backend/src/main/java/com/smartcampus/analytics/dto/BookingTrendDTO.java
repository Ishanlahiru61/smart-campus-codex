package com.smartcampus.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class BookingTrendDTO {
    private String date; // e.g. "2026-04-01"
    private long count;
}
