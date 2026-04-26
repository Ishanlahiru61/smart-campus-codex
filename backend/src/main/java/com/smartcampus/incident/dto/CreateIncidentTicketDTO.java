package com.smartcampus.incident.dto;

import com.smartcampus.incident.entity.*;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CreateIncidentTicketDTO {

    @NotBlank(message = "Facility ID is required")
    private String facilityId;

    @NotBlank(message = "Facility name is required")
    private String facilityName;

    @NotBlank(message = "Category is required")
    private String category;

    @NotBlank(message = "Title is required")
    @Size(min = 5, max = 100, message = "Title must be between 5 and 100 characters")
    private String title;

    @NotBlank(message = "Description is required")
    @Size(min = 10, max = 1000, message = "Description must be between 10 and 1000 characters")
    private String description;

    @NotNull(message = "Priority is required")
    private IncidentTicket.TicketPriority priority;

    @NotBlank(message = "Reported by name is required")
    private String reportedBy;

    // Optional fields — send null from frontend, not empty string
    @Email(message = "Invalid email format")
    private String reportedByEmail;

    @Pattern(regexp = "^[+]?[0-9]{10,}$", message = "Invalid phone number (min 10 digits)")
    private String reportedByPhone;
}
