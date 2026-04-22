package com.smartcampus.facilities.dto;

import com.smartcampus.facilities.model.Facility;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import jakarta.validation.constraints.*;
import java.time.LocalDateTime;
import java.util.List;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class FacilityRequestDTO {

    @NotBlank(message = "Facility name is required")
    @Size(min = 3, max = 100, message = "Facility name must be between 3 and 100 characters")
    private String name;

    @NotBlank(message = "Facility type is required")
    private String type;

    @NotNull(message = "Capacity is required")
    @Min(value = 1, message = "Capacity must be at least 1")
    private Integer capacity;

    @NotBlank(message = "Location is required")
    private String location;

    @Size(max = 500, message = "Description must not exceed 500 characters")
    private String description;

    @NotNull(message = "Status is required")
    private Facility.FacilityStatus status;

    private List<String> amenities;

    private Double latitude;

    private Double longitude;

    private Integer floorNumber;

    private String buildingCode;

    private String contactPerson;

    @Email(message = "Invalid email format")
    private String contactEmail;

    @Pattern(regexp = "^[+]?[0-9]{10,}$", message = "Invalid phone number")
    private String contactPhone;

    private List<Facility.AvailabilityWindow> availabilityWindows;

    @DecimalMin(value = "0.0", message = "Cost per hour must be non-negative")
    private Double costPerHour;

    private Boolean requiresApproval;

    private String imageUrl;
}

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
class FacilityResponseDTO {

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
