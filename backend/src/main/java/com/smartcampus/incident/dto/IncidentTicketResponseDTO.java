package com.smartcampus.incidents.dto;

import com.smartcampus.incidents.model.IncidentTicket;
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
public class IncidentTicketResponseDTO {

    private String id;
    private String ticketNumber;
    private String facilityId;
    private String facilityName;
    private String category;
    private String title;
    private String description;
    private IncidentTicket.TicketPriority priority;
    private IncidentTicket.TicketStatus status;
    private String rejectionReason;
    private String reportedBy;
    private String reportedByEmail;
    private String reportedByPhone;
    private String assignedTechnician;
    private String technicianName;
    private String resolutionNotes;
    private List<AttachmentDTO> attachments;
    private List<CommentDTO> comments;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private LocalDateTime resolvedAt;
    private LocalDateTime closedAt;
    private Integer totalComments;
    private Integer totalAttachments;

    public static IncidentTicketResponseDTO fromEntity(IncidentTicket ticket) {
        return IncidentTicketResponseDTO.builder()
                .id(ticket.getId())
                .ticketNumber(ticket.getTicketNumber())
                .facilityId(ticket.getFacilityId())
                .facilityName(ticket.getFacilityName())
                .category(ticket.getCategory())
                .title(ticket.getTitle())
                .description(ticket.getDescription())
                .priority(ticket.getPriority())
                .status(ticket.getStatus())
                .rejectionReason(ticket.getRejectionReason())
                .reportedBy(ticket.getReportedBy())
                .reportedByEmail(ticket.getReportedByEmail())
                .reportedByPhone(ticket.getReportedByPhone())
                .assignedTechnician(ticket.getAssignedTechnician())
                .technicianName(ticket.getTechnicianName())
                .resolutionNotes(ticket.getResolutionNotes())
                .attachments(ticket.getAttachments() != null
                        ? ticket.getAttachments().stream().map(AttachmentDTO::fromEntity).toList()
                        : null)
                .comments(ticket.getComments() != null
                        ? ticket.getComments().stream().map(CommentDTO::fromEntity).toList()
                        : null)
                .createdAt(ticket.getCreatedAt())
                .updatedAt(ticket.getUpdatedAt())
                .resolvedAt(ticket.getResolvedAt())
                .closedAt(ticket.getClosedAt())
                .totalComments(ticket.getTotalComments())
                .totalAttachments(ticket.getTotalAttachments())
                .build();
    }

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    @Builder
    private static class AttachmentDTO {
        private String id;
        private String fileName;
        private String fileUrl;
        private String fileType;
        private Long fileSize;
        private String uploadedBy;
        private LocalDateTime uploadedAt;

        public static AttachmentDTO fromEntity(IncidentTicket.Attachment attachment) {
            return AttachmentDTO.builder()
                    .id(attachment.getId())
                    .fileName(attachment.getFileName())
                    .fileUrl(attachment.getFileUrl())
                    .fileType(attachment.getFileType())
                    .fileSize(attachment.getFileSize())
                    .uploadedBy(attachment.getUploadedBy())
                    .uploadedAt(attachment.getUploadedAt())
                    .build();
        }
    }
}
