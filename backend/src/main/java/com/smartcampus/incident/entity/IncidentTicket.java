package com.smartcampus.incidents.model;

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
@Document(collection = "incident_tickets")
public class IncidentTicket {

    @Id
    private String id;

    private String ticketNumber;           // Unique identifier like INC-001

    private String facilityId;             // Reference to facility

    private String facilityName;           // Facility name for quick access

    private String category;               // e.g., ELECTRICAL, PLUMBING, STRUCTURAL, EQUIPMENT, SAFETY

    private String title;

    private String description;

    private TicketPriority priority;       // HIGH, MEDIUM, LOW

    private TicketStatus status;           // OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED

    private String rejectionReason;        // If status is REJECTED

    private String reportedBy;             // User who reported

    private String reportedByEmail;

    private String reportedByPhone;

    private String assignedTechnician;     // ID of assigned technician

    private String technicianName;         // Name of assigned technician

    private String resolutionNotes;        // Resolution details

    private List<Attachment> attachments;  // Up to 3 image attachments

    private List<Comment> comments;        // Comments on ticket

    private LocalDateTime createdAt;

    private LocalDateTime updatedAt;

    private LocalDateTime resolvedAt;

    private LocalDateTime closedAt;

    private Integer totalComments;

    private Integer totalAttachments;

    // Enums
    public enum TicketPriority {
        HIGH, MEDIUM, LOW, CRITICAL
    }

    public enum TicketStatus {
        OPEN, IN_PROGRESS, RESOLVED, CLOSED, REJECTED
    }

    // Nested classes
    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Attachment {
        private String id;
        private String fileName;
        private String fileUrl;
        private String fileType;
        private Long fileSize;
        private String uploadedBy;
        private LocalDateTime uploadedAt;
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    public static class Comment {
        private String id;
        private String content;
        private String commentedBy;
        private String commentedByRole;    // USER, TECHNICIAN, ADMIN
        private LocalDateTime createdAt;
        private LocalDateTime updatedAt;
        private Boolean canEdit;           // Only if user is the one who commented
        private Boolean canDelete;
    }
}
