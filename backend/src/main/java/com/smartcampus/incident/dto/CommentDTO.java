package com.smartcampus.incidents.dto;

import com.smartcampus.incidents.model.IncidentTicket;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CommentDTO {

    private String id;
    private String content;
    private String commentedBy;
    private String commentedByRole;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Boolean canEdit;
    private Boolean canDelete;

    public static CommentDTO fromEntity(IncidentTicket.Comment comment) {
        return CommentDTO.builder()
                .id(comment.getId())
                .content(comment.getContent())
                .commentedBy(comment.getCommentedBy())
                .commentedByRole(comment.getCommentedByRole())
                .createdAt(comment.getCreatedAt())
                .updatedAt(comment.getUpdatedAt())
                .canEdit(comment.getCanEdit())
                .canDelete(comment.getCanDelete())
                .build();
    }
}
