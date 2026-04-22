package com.smartcampus.facility.dto;

import com.smartcampus.facility.entity.Facility;
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
