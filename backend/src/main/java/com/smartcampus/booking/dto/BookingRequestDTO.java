package com.smartcampus.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {

    @NotBlank(message = "Resource ID is required")
    public String resourceId;

    @NotNull(message = "Start time is required")
    public LocalDateTime startTime;

    @NotNull(message = "End time is required")
    public LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    public String purpose;

    @Min(value = 1, message = "Attendees must be at least 1")
    public int attendees;
}