package com.smartcampus.incidents.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AddCommentDTO {

    @NotBlank(message = "Comment content is required")
    @Size(min = 2, max = 1000, message = "Comment must be between 2 and 1000 characters")
    private String content;

    @NotBlank(message = "Commenter name is required")
    private String commentedBy;

    @NotNull(message = "User role is required")
    private String commentedByRole;
}
