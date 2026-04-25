package com.smartcampus.analytics.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class TopResourceDTO {
    private String facilityId;
    private String facilityName;
    private long totalBookings;
}
