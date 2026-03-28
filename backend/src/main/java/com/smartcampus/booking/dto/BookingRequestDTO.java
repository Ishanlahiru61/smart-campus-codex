package com.smartcampus.booking.dto;

import lombok.Data;
import java.time.LocalDateTime;

@Data
public class BookingRequestDTO {
    public String resourceId;
    public LocalDateTime startTime;
    public LocalDateTime endTime;
    public String purpose;
    public int attendees;
}