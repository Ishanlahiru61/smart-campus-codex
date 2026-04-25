package com.smartcampus.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PeakHourDTO {
    private String hour; // e.g. "10:00"
    private long bookingCount;
}
