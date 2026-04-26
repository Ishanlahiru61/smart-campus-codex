package com.smartcampus.booking.entity;

import com.smartcampus.facility.entity.Facility;
import lombok.*;
import org.springframework.data.annotation.Id;
import org.springframework.data.annotation.Transient;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;

@Document(collection = "bookings")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Booking {

    @Id
    private String id;

    private String resourceId;
    private String userId;

    @Transient
    private Facility facility;

    private LocalDateTime startTime;
    private LocalDateTime endTime;

    private String purpose;
    private int attendees;

    private BookingStatus status;

    private String rejectionReason;

    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}