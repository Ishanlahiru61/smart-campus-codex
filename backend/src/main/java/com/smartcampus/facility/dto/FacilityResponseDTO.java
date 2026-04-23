package com.smartcampus.facility.dto;

import com.smartcampus.facility.entity.Facility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityResponseDTO {

    private String id;
    private String name;
    private String type;
    private Integer capacity;
    private String location;
    private String description;
    private Facility.FacilityStatus status;
    private List<String> amenities;
    private Double latitude;
    private Double longitude;
    private Integer floorNumber;
    private String buildingCode;
    private String contactPerson;
    private String contactEmail;
    private String contactPhone;
    private List<Facility.AvailabilityWindow> availabilityWindows;
    private Double costPerHour;
    private Boolean requiresApproval;
    private String imageUrl;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private String createdBy;
    private String updatedBy;
    private Integer totalBookings;
    private Double averageRating;

    public static FacilityResponseDTO fromEntity(Facility facility) {
        return FacilityResponseDTO.builder()
                .id(facility.getId())
                .name(facility.getName())
                .type(facility.getType())
                .capacity(facility.getCapacity())
                .location(facility.getLocation())
                .description(facility.getDescription())
                .status(facility.getStatus())
                .amenities(facility.getAmenities())
                .latitude(facility.getLatitude())
                .longitude(facility.getLongitude())
                .floorNumber(facility.getFloorNumber())
                .buildingCode(facility.getBuildingCode())
                .contactPerson(facility.getContactPerson())
                .contactEmail(facility.getContactEmail())
                .contactPhone(facility.getContactPhone())
                .availabilityWindows(facility.getAvailabilityWindows())
                .costPerHour(facility.getCostPerHour())
                .requiresApproval(facility.getRequiresApproval())
                .imageUrl(facility.getImageUrl())
                .createdAt(facility.getCreatedAt())
                .updatedAt(facility.getUpdatedAt())
                .createdBy(facility.getCreatedBy())
                .updatedBy(facility.getUpdatedBy())
                .totalBookings(facility.getTotalBookings())
                .averageRating(facility.getAverageRating())
                .build();
    }
}
