package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.dto.CreateIncidentTicketDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import com.smartcampus.service.CloudinaryService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.notification.entity.NotificationType;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.entity.User;

import java.time.LocalDateTime;
import java.util.*;

@Service
@RequiredArgsConstructor
public class IncidentTicketServiceImpl implements IncidentTicketService {

    private final IncidentTicketRepository repository;
    private final CloudinaryService cloudinaryService;
    private final NotificationService notificationService;
    private final UserRepository userRepository;

    @Override
    public List<IncidentTicket> getAllTickets() {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> 
                a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TECHNICIAN"))) {
            return repository.findAll();
        } else if (auth != null) {
            return repository.findByReportedBy(auth.getName());
        }
        return List.of();
    }

    @Override
    public List<IncidentTicket> getTicketsByStatus(IncidentTicket.TicketStatus status) {
        return repository.findByStatus(status);
    }

    @Override
    public List<IncidentTicket> getTicketsByFacility(String facilityId) {
        return repository.findByFacilityId(facilityId);
    }

    @Override
    public List<IncidentTicket> getTicketsByPriority(IncidentTicket.TicketPriority priority) {
        return repository.findByPriority(priority);
    }

    @Override
    public Optional<IncidentTicket> getTicketById(String id) {
        return repository.findById(id).map(ticket -> {
            checkOwnership(ticket);
            return ticket;
        });
    }

    private void checkOwnership(IncidentTicket ticket) {
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isPrivileged = auth.getAuthorities().stream().anyMatch(a -> 
                    a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_TECHNICIAN"));
            if (!isPrivileged && !ticket.getReportedBy().equals(auth.getName())) {
                throw new AccessDeniedException("Access denied: You do not own this ticket");
            }
        }
    }

    @Override
    public List<IncidentTicket> getOpenTickets() {
        return repository.findOpenTickets();
    }

    @Override
    public List<IncidentTicket> getUnassignedTickets() {
        return repository.findUnassignedTickets();
    }

    @Override
    public List<IncidentTicket> getTechnicianTickets(String technicianId) {
        return repository.findByAssignedTechnician(technicianId);
    }

    @Override
    public List<IncidentTicket> searchTickets(String keyword) {
        return repository.searchByTitle(keyword);
    }

    @Override
    public Map<String, Object> getStatistics() {
        Map<String, Object> stats = new HashMap<>();
        stats.put("total", repository.count());
        stats.put("open", repository.countByStatus(IncidentTicket.TicketStatus.OPEN));
        stats.put("inProgress", repository.countByStatus(IncidentTicket.TicketStatus.IN_PROGRESS));
        stats.put("resolved", repository.countByStatus(IncidentTicket.TicketStatus.RESOLVED));
        return stats;
    }

    @Override
    public IncidentTicket createIncidentTicket(CreateIncidentTicketDTO request, MultipartFile[] files) {
        String currentUser = "UNKNOWN";
        if (SecurityContextHolder.getContext().getAuthentication() != null) {
            currentUser = SecurityContextHolder.getContext().getAuthentication().getName();
        }

        List<IncidentTicket.Attachment> attachments = new ArrayList<>();
        if (files != null) {
            if (files.length > 3) {
                throw new IllegalArgumentException("Maximum of 3 images allowed");
            }
            for (MultipartFile file : files) {
                if (!file.isEmpty()) {
                    try {
                        String fileUrl = cloudinaryService.uploadFile(file);
                        attachments.add(IncidentTicket.Attachment.builder()
                                .id(UUID.randomUUID().toString())
                                .fileName(file.getOriginalFilename())
                                .fileUrl(fileUrl)
                                .fileType(file.getContentType())
                                .fileSize(file.getSize())
                                .uploadedBy(currentUser)
                                .uploadedAt(LocalDateTime.now())
                                .build());
                    } catch (Exception e) {
                        throw new RuntimeException("Failed to upload image: " + e.getMessage());
                    }
                }
            }
        }

        IncidentTicket ticket = IncidentTicket.builder()
                .ticketNumber("INC-" + System.currentTimeMillis())
                .facilityId(request.getFacilityId())
                .facilityName(request.getFacilityName())
                .category(request.getCategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(IncidentTicket.TicketStatus.OPEN)
                .reportedBy(currentUser)
                .reportedByEmail(currentUser)           // always set from JWT — reliable for /filter/my
                .reportedByPhone(request.getReportedByPhone())
                .attachments(attachments)
                .totalAttachments(attachments.size())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        IncidentTicket savedTicket = repository.save(ticket);

        userRepository.findByRolesContaining("ROLE_ADMIN").forEach(admin -> {
            notificationService.createAndSendNotification(
                    admin.getEmail(),
                    "ADMIN",
                    "New incident ticket created",
                    NotificationType.TICKET
            );
        });

        return savedTicket;
    }

    @Override
    public Optional<IncidentTicket> addAttachment(String id, MultipartFile file, String uploadedBy) {
        return repository.findById(id).map(ticket -> {
            checkOwnership(ticket);
            List<IncidentTicket.Attachment> attachments = ticket.getAttachments();
            if (attachments == null) attachments = new ArrayList<>();
            attachments.add(IncidentTicket.Attachment.builder()
                    .id(UUID.randomUUID().toString())
                    .fileName(file.getOriginalFilename())
                    .fileUrl("/dummy-url/" + file.getOriginalFilename())
                    .uploadedBy(uploadedBy)
                    .uploadedAt(LocalDateTime.now())
                    .build());
            ticket.setAttachments(attachments);
            ticket.setTotalAttachments(attachments.size());
            return repository.save(ticket);
        });
    }

    @Override
    public Optional<IncidentTicket> addComment(String id, AddCommentDTO commentRequest) {
        return repository.findById(id).map(ticket -> {
            checkOwnership(ticket);
            List<IncidentTicket.Comment> comments = ticket.getComments();
            if (comments == null) comments = new ArrayList<>();
            comments.add(IncidentTicket.Comment.builder()
                    .id(UUID.randomUUID().toString())
                    .content(commentRequest.getContent())
                    .commentedBy(commentRequest.getCommentedBy())
                    .commentedByRole(commentRequest.getCommentedByRole())
                    .createdAt(LocalDateTime.now())
                    .updatedAt(LocalDateTime.now())
                    .build());
            ticket.setComments(comments);
            ticket.setTotalComments(comments.size());
            return repository.save(ticket);
        });
    }

    @Override
    public Optional<IncidentTicket> updateTicket(String id, CreateIncidentTicketDTO request) {
        return repository.findById(id).map(ticket -> {
            checkOwnership(ticket);
            ticket.setTitle(request.getTitle());
            ticket.setDescription(request.getDescription());
            ticket.setPriority(request.getPriority());
            ticket.setCategory(request.getCategory());
            ticket.setUpdatedAt(LocalDateTime.now());
            return repository.save(ticket);
        });
    }

    @Override
    public Optional<IncidentTicket> updateComment(String ticketId, String commentId, String newContent, String userId) {
        return repository.findById(ticketId).map(ticket -> {
            checkOwnership(ticket);
            if (ticket.getComments() != null) {
                ticket.getComments().stream()
                        .filter(c -> c.getId().equals(commentId) && c.getCommentedBy().equals(userId))
                        .findFirst()
                        .ifPresent(c -> {
                            c.setContent(newContent);
                            c.setUpdatedAt(LocalDateTime.now());
                        });
            }
            return repository.save(ticket);
        });
    }

    @Override
    public Optional<IncidentTicket> updateTicketStatus(String id, IncidentTicket.TicketStatus status, String resolutionNotes, String rejectionReason) {
        return repository.findById(id).map(ticket -> {
            ticket.setStatus(status);
            ticket.setResolutionNotes(resolutionNotes);
            ticket.setRejectionReason(rejectionReason);
            ticket.setUpdatedAt(LocalDateTime.now());
            if (status == IncidentTicket.TicketStatus.RESOLVED) {
                ticket.setResolvedAt(LocalDateTime.now());
            } else if (status == IncidentTicket.TicketStatus.CLOSED) {
                ticket.setClosedAt(LocalDateTime.now());
            }
            IncidentTicket savedTicket = repository.save(ticket);
            
            // Notify Technician if assigned
            if (savedTicket.getAssignedTechnician() != null) {
                notificationService.createAndSendNotification(
                        savedTicket.getAssignedTechnician(),
                        "TECHNICIAN",
                        "Ticket status updated to " + status.name(),
                        NotificationType.TICKET
                );
            }
            
            return savedTicket;
        });
    }

    @Override
    public Optional<IncidentTicket> assignTechnician(String id, String technicianId, String technicianName) {
        return repository.findById(id).map(ticket -> {
            ticket.setAssignedTechnician(technicianId);
            ticket.setTechnicianName(technicianName);
            ticket.setUpdatedAt(LocalDateTime.now());
            IncidentTicket savedTicket = repository.save(ticket);
            
            notificationService.createAndSendNotification(
                    technicianId,
                    "TECHNICIAN",
                    "You have been assigned a new ticket",
                    NotificationType.TICKET
            );
            
            return savedTicket;
        });
    }

    @Override
    public Optional<IncidentTicket> unassignTechnician(String id) {
        return repository.findById(id).map(ticket -> {
            ticket.setAssignedTechnician(null);
            ticket.setTechnicianName(null);
            ticket.setUpdatedAt(LocalDateTime.now());
            return repository.save(ticket);
        });
    }

    @Override
    public boolean deleteTicket(String id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return true;
        }
        return false;
    }

    @Override
    public Optional<IncidentTicket> removeAttachment(String ticketId, String attachmentId) {
        return repository.findById(ticketId).map(ticket -> {
            checkOwnership(ticket);
            if (ticket.getAttachments() != null) {
                ticket.getAttachments().removeIf(a -> a.getId().equals(attachmentId));
                ticket.setTotalAttachments(ticket.getAttachments().size());
            }
            return repository.save(ticket);
        });
    }

    @Override
    public Optional<IncidentTicket> deleteComment(String ticketId, String commentId, String userId) {
        return repository.findById(ticketId).map(ticket -> {
            checkOwnership(ticket);
            if (ticket.getComments() != null) {
                ticket.getComments().removeIf(c -> c.getId().equals(commentId) && c.getCommentedBy().equals(userId));
                ticket.setTotalComments(ticket.getComments().size());
            }
            return repository.save(ticket);
        });
    }
}
