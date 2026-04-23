package com.smartcampus.facility.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
@Document(collection = "facilities")
public class Facility {

    @Id
    private String id;

    private String name;

    private String type; // LECTURE_HALL, LAB, MEETING_ROOM, EQUIPMENT

    private Integer capacity;

    private String location;

    private String description;

    private FacilityStatus status; // ACTIVE, OUT_OF_SERVICE

    private List<String> amenities; // e.g., ["projector", "whiteboard", "ac"]

    private Double latitude;

    private Double longitude;

    private Integer floorNumber;

    private String buildingCode;

    private String contactPerson;

    private String contactEmail;

    private String contactPhone;

    private List<AvailabilityWindow> availabilityWindows;

    private Double costPerHour;

    private Boolean requiresApproval;

    private String imageUrl;

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private String createdBy;

    private String updatedBy;

    private Integer totalBookings;

    private Double averageRating;

    public enum FacilityStatus {
        ACTIVE, OUT_OF_SERVICE, MAINTENANCE
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class AvailabilityWindow {
        private String dayOfWeek; // MONDAY, TUESDAY, etc.
        private String startTime; // HH:mm format
        private String endTime;   // HH:mm format
    }
}
