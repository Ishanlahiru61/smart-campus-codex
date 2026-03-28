package com.smartcampus.booking.entity;

import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id; // Mongo uses String, NOT Long

    private String resourceId;
    private String userId;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;
    private int attendees;

    private BookingStatus status;
}