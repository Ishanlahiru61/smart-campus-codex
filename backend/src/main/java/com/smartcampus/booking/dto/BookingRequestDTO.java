package com.smartcampus.booking.dto;

import jakarta.validation.constraints.*;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {

    @NotBlank(message = "Resource ID is required")
    @Size(max = 50, message = "Resource ID cannot exceed 50 characters")
    private String resourceId;

    @NotNull(message = "Start time is required")
    @Future(message = "Start time must be in the future")
    private LocalDateTime startTime;

    @NotNull(message = "End time is required")
    private LocalDateTime endTime;

    @NotBlank(message = "Purpose is required")
    @Size(min = 5, max = 255, message = "Purpose must be between 5 and 255 characters")
    private String purpose;

    @Min(value = 1, message = "Attendees must be at least 1")
    @Max(value = 1000, message = "Attendees cannot exceed 1000")
    private int attendees;
}