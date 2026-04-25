package com.smartcampus.incident.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.notification.entity.NotificationType;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Service
@RequiredArgsConstructor
public class TechnicianTicketService {

    private final IncidentTicketRepository repository;
    private final UserRepository userRepository;
    private final NotificationService notificationService;

    private String getCurrentUser() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    public List<IncidentTicket> getAssignedTickets() {
        String email = getCurrentUser();
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isPresent()) {
            String userId = userOpt.get().getId();
            return repository.findAll().stream()
                .filter(t -> email.equals(t.getAssignedTechnician()) || userId.equals(t.getAssignedTechnician()))
                .toList();
        }
        
        return repository.findByAssignedTechnician(email);
    }

    public Optional<IncidentTicket> getAssignedTicketById(String id) {
        String email = getCurrentUser();
        Optional<User> userOpt = userRepository.findByEmail(email);
        String userId = userOpt.isPresent() ? userOpt.get().getId() : "NON_EXISTENT_ID";

        return repository.findById(id).filter(ticket -> 
            email.equals(ticket.getAssignedTechnician()) || userId.equals(ticket.getAssignedTechnician())
        );
    }

    public IncidentTicket updateTicketStatus(String id, IncidentTicket.TicketStatus status, String resolutionNotes) {
        IncidentTicket ticket = getAssignedTicketById(id)
                .orElseThrow(() -> new AccessDeniedException("Ticket not found or not assigned to you"));

        // Enforce valid status transition logic if needed (e.g., OPEN -> IN_PROGRESS -> RESOLVED)
        if (status == IncidentTicket.TicketStatus.OPEN || status == IncidentTicket.TicketStatus.REJECTED || status == IncidentTicket.TicketStatus.CLOSED) {
            throw new IllegalArgumentException("Technicians can only transition status to IN_PROGRESS or RESOLVED");
        }

        ticket.setStatus(status);
        if (resolutionNotes != null && !resolutionNotes.isBlank()) {
            ticket.setResolutionNotes(resolutionNotes);
        }
        
        ticket.setUpdatedAt(LocalDateTime.now());
        if (status == IncidentTicket.TicketStatus.RESOLVED) {
            ticket.setResolvedAt(LocalDateTime.now());
        }

        IncidentTicket savedTicket = repository.save(ticket);
        
        userRepository.findByRolesContaining("ROLE_ADMIN").forEach(admin -> {
            notificationService.createAndSendNotification(
                    admin.getEmail(),
                    "ADMIN",
                    "Ticket status updated to " + status.name() + " by technician",
                    NotificationType.TICKET
            );
        });

        return savedTicket;
    }

    public IncidentTicket addComment(String id, AddCommentDTO commentRequest) {
        IncidentTicket ticket = getAssignedTicketById(id)
                .orElseThrow(() -> new AccessDeniedException("Ticket not found or not assigned to you"));

        String currentUser = getCurrentUser();
        
        List<IncidentTicket.Comment> comments = ticket.getComments();
        if (comments == null) {
            comments = new ArrayList<>();
        }
        
        comments.add(IncidentTicket.Comment.builder()
                .id(UUID.randomUUID().toString())
                .content(commentRequest.getContent())
                .commentedBy(currentUser)
                .commentedByRole("TECHNICIAN")
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build());
                
        ticket.setComments(comments);
        ticket.setTotalComments(comments.size());
        
        return repository.save(ticket);
    }
}
