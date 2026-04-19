package com.smartcampus.incidents.service;

import com.smartcampus.incidents.dto.AddCommentDTO;
import com.smartcampus.incidents.dto.CreateIncidentTicketDTO;
import com.smartcampus.incidents.model.IncidentTicket;
import com.smartcampus.incidents.repository.IncidentTicketRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.IOException;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class IncidentTicketService {

    private final IncidentTicketRepository ticketRepository;
    private static final AtomicLong ticketCounter = new AtomicLong(1000);

    // ==================== TICKET CRUD OPERATIONS ====================

    /**
     * GET: Retrieve all tickets
     */
    public List<IncidentTicket> getAllTickets() {
        return ticketRepository.findAll();
    }

    /**
     * GET: Retrieve ticket by ID
     */
    public Optional<IncidentTicket> getTicketById(String id) {
        return ticketRepository.findById(id);
    }

    /**
     * POST: Create a new incident ticket
     */
    public IncidentTicket createIncidentTicket(CreateIncidentTicketDTO request) {
        String ticketNumber = generateTicketNumber();

        IncidentTicket ticket = IncidentTicket.builder()
                .ticketNumber(ticketNumber)
                .facilityId(request.getFacilityId())
                .facilityName(request.getFacilityName())
                .category(request.getCategory())
                .title(request.getTitle())
                .description(request.getDescription())
                .priority(request.getPriority())
                .status(IncidentTicket.TicketStatus.OPEN)
                .reportedBy(request.getReportedBy())
                .reportedByEmail(request.getReportedByEmail())
                .reportedByPhone(request.getReportedByPhone())
                .attachments(new ArrayList<>())
                .comments(new ArrayList<>())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .totalComments(0)
                .totalAttachments(0)
                .build();

        return ticketRepository.save(ticket);
    }

    /**
     * PUT: Update ticket details
     */
    public Optional<IncidentTicket> updateTicket(String id, CreateIncidentTicketDTO request) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    if (request.getTitle() != null) ticket.setTitle(request.getTitle());
                    if (request.getDescription() != null) ticket.setDescription(request.getDescription());
                    if (request.getPriority() != null) ticket.setPriority(request.getPriority());
                    if (request.getReportedByEmail() != null) ticket.setReportedByEmail(request.getReportedByEmail());
                    if (request.getReportedByPhone() != null) ticket.setReportedByPhone(request.getReportedByPhone());

                    ticket.setUpdatedAt(LocalDateTime.now());
                    return ticketRepository.save(ticket);
                });
    }

    /**
     * DELETE: Remove ticket
     */
    public boolean deleteTicket(String id) {
        if (ticketRepository.existsById(id)) {
            ticketRepository.deleteById(id);
            return true;
        }
        return false;
    }

    // ==================== TICKET FILTERING ====================

    /**
     * GET: Filter tickets by status
     */
    public List<IncidentTicket> getTicketsByStatus(IncidentTicket.TicketStatus status) {
        return ticketRepository.findByStatus(status);
    }

    /**
     * GET: Filter tickets by facility
     */
    public List<IncidentTicket> getTicketsByFacility(String facilityId) {
        return ticketRepository.findByFacilityId(facilityId);
    }

    /**
     * GET: Filter tickets by priority
     */
    public List<IncidentTicket> getTicketsByPriority(IncidentTicket.TicketPriority priority) {
        return ticketRepository.findByPriority(priority);
    }

    /**
     * GET: Search tickets by title
     */
    public List<IncidentTicket> searchTickets(String keyword) {
        return ticketRepository.searchByTitle(keyword);
    }

    /**
     * GET: Get open tickets
     */
    public List<IncidentTicket> getOpenTickets() {
        return ticketRepository.findOpenTickets();
    }

    /**
     * GET: Get unassigned tickets
     */
    public List<IncidentTicket> getUnassignedTickets() {
        return ticketRepository.findUnassignedTickets();
    }

    /**
     * GET: Get assigned technician tickets
     */
    public List<IncidentTicket> getTechnicianTickets(String technicianId) {
        return ticketRepository.findByAssignedTechnician(technicianId);
    }

    // ==================== STATUS MANAGEMENT ====================

    /**
     * PATCH: Update ticket status
     */
    public Optional<IncidentTicket> updateTicketStatus(String id, IncidentTicket.TicketStatus newStatus, 
                                                        String resolutionNotes, String rejectionReason) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setStatus(newStatus);

                    if (resolutionNotes != null && !resolutionNotes.isEmpty()) {
                        ticket.setResolutionNotes(resolutionNotes);
                    }

                    if (rejectionReason != null && !rejectionReason.isEmpty()) {
                        ticket.setRejectionReason(rejectionReason);
                    }

                    if (newStatus == IncidentTicket.TicketStatus.RESOLVED) {
                        ticket.setResolvedAt(LocalDateTime.now());
                    }

                    if (newStatus == IncidentTicket.TicketStatus.CLOSED) {
                        ticket.setClosedAt(LocalDateTime.now());
                    }

                    ticket.setUpdatedAt(LocalDateTime.now());
                    return ticketRepository.save(ticket);
                });
    }

    // ==================== TECHNICIAN MANAGEMENT ====================

    /**
     * PATCH: Assign technician to ticket
     */
    public Optional<IncidentTicket> assignTechnician(String id, String technicianId, String technicianName) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setAssignedTechnician(technicianId);
                    ticket.setTechnicianName(technicianName);

                    // Auto-update status to IN_PROGRESS when assigned
                    if (ticket.getStatus() == IncidentTicket.TicketStatus.OPEN) {
                        ticket.setStatus(IncidentTicket.TicketStatus.IN_PROGRESS);
                    }

                    ticket.setUpdatedAt(LocalDateTime.now());
                    return ticketRepository.save(ticket);
                });
    }

    /**
     * PATCH: Unassign technician from ticket
     */
    public Optional<IncidentTicket> unassignTechnician(String id) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    ticket.setAssignedTechnician(null);
                    ticket.setTechnicianName(null);
                    ticket.setUpdatedAt(LocalDateTime.now());
                    return ticketRepository.save(ticket);
                });
    }

    // ==================== ATTACHMENT MANAGEMENT ====================

    /**
     * POST: Add attachment to ticket (max 3)
     */
    public Optional<IncidentTicket> addAttachment(String id, MultipartFile file, String uploadedBy) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    // Check if max attachments reached
                    if (ticket.getAttachments() != null && ticket.getAttachments().size() >= 3) {
                        throw new RuntimeException("Maximum 3 attachments allowed per ticket");
                    }

                    // Validate file type
                    validateFileType(file);

                    try {
                        // Save file and get URL
                        String fileUrl = saveFile(file);

                        IncidentTicket.Attachment attachment = IncidentTicket.Attachment.builder()
                                .id(UUID.randomUUID().toString())
                                .fileName(file.getOriginalFilename())
                                .fileUrl(fileUrl)
                                .fileType(file.getContentType())
                                .fileSize(file.getSize())
                                .uploadedBy(uploadedBy)
                                .uploadedAt(LocalDateTime.now())
                                .build();

                        if (ticket.getAttachments() == null) {
                            ticket.setAttachments(new ArrayList<>());
                        }

                        ticket.getAttachments().add(attachment);
                        ticket.setTotalAttachments(ticket.getAttachments().size());
                        ticket.setUpdatedAt(LocalDateTime.now());

                        return ticketRepository.save(ticket);
                    } catch (IOException e) {
                        throw new RuntimeException("Failed to upload file: " + e.getMessage());
                    }
                });
    }

    /**
     * DELETE: Remove attachment from ticket
     */
    public Optional<IncidentTicket> removeAttachment(String ticketId, String attachmentId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    if (ticket.getAttachments() != null) {
                        ticket.setAttachments(
                            ticket.getAttachments().stream()
                                .filter(att -> !att.getId().equals(attachmentId))
                                .collect(Collectors.toList())
                        );
                        ticket.setTotalAttachments(ticket.getAttachments().size());
                        ticket.setUpdatedAt(LocalDateTime.now());
                        return ticketRepository.save(ticket);
                    }
                    return ticket;
                });
    }

    // ==================== COMMENT MANAGEMENT ====================

    /**
     * POST: Add comment to ticket
     */
    public Optional<IncidentTicket> addComment(String id, AddCommentDTO commentRequest) {
        return ticketRepository.findById(id)
                .map(ticket -> {
                    IncidentTicket.Comment comment = IncidentTicket.Comment.builder()
                            .id(UUID.randomUUID().toString())
                            .content(commentRequest.getContent())
                            .commentedBy(commentRequest.getCommentedBy())
                            .commentedByRole(commentRequest.getCommentedByRole())
                            .createdAt(LocalDateTime.now())
                            .updatedAt(LocalDateTime.now())
                            .canEdit(true)
                            .canDelete(true)
                            .build();

                    if (ticket.getComments() == null) {
                        ticket.setComments(new ArrayList<>());
                    }

                    ticket.getComments().add(comment);
                    ticket.setTotalComments(ticket.getComments().size());
                    ticket.setUpdatedAt(LocalDateTime.now());

                    return ticketRepository.save(ticket);
                });
    }

    /**
     * PUT: Update comment
     */
    public Optional<IncidentTicket> updateComment(String ticketId, String commentId, String newContent, String userId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    if (ticket.getComments() != null) {
                        ticket.setComments(
                            ticket.getComments().stream()
                                .map(comment -> {
                                    if (comment.getId().equals(commentId) && comment.getCommentedBy().equals(userId)) {
                                        comment.setContent(newContent);
                                        comment.setUpdatedAt(LocalDateTime.now());
                                    }
                                    return comment;
                                })
                                .collect(Collectors.toList())
                        );
                        ticket.setUpdatedAt(LocalDateTime.now());
                        return ticketRepository.save(ticket);
                    }
                    return ticket;
                });
    }

    /**
     * DELETE: Remove comment
     */
    public Optional<IncidentTicket> deleteComment(String ticketId, String commentId, String userId) {
        return ticketRepository.findById(ticketId)
                .map(ticket -> {
                    if (ticket.getComments() != null) {
                        ticket.setComments(
                            ticket.getComments().stream()
                                .filter(comment -> !(comment.getId().equals(commentId) && 
                                       comment.getCommentedBy().equals(userId)))
                                .collect(Collectors.toList())
                        );
                        ticket.setTotalComments(ticket.getComments().size());
                        ticket.setUpdatedAt(LocalDateTime.now());
                        return ticketRepository.save(ticket);
                    }
                    return ticket;
                });
    }

    // ==================== STATISTICS ====================

    /**
     * GET: Get ticket statistics
     */
    public TicketStatistics getStatistics() {
        List<IncidentTicket> allTickets = ticketRepository.findAll();

        return TicketStatistics.builder()
                .totalTickets((int) ticketRepository.count())
                .openTickets(ticketRepository.countByStatus(IncidentTicket.TicketStatus.OPEN).intValue())
                .inProgressTickets(ticketRepository.countByStatus(IncidentTicket.TicketStatus.IN_PROGRESS).intValue())
                .resolvedTickets(ticketRepository.countByStatus(IncidentTicket.TicketStatus.RESOLVED).intValue())
                .closedTickets(ticketRepository.countByStatus(IncidentTicket.TicketStatus.CLOSED).intValue())
                .rejectedTickets(ticketRepository.countByStatus(IncidentTicket.TicketStatus.REJECTED).intValue())
                .highPriorityTickets(ticketRepository.countByPriority(IncidentTicket.TicketPriority.HIGH).intValue())
                .unassignedTickets((int) ticketRepository.findUnassignedTickets().size())
                .averageResolutionTime(calculateAverageResolutionTime(allTickets))
                .build();
    }

    // ==================== HELPER METHODS ====================

    private String generateTicketNumber() {
        return "INC-" + String.format("%06d", ticketCounter.incrementAndGet());
    }

    private String saveFile(MultipartFile file) throws IOException {
        String uploadDir = "./uploads/incidents";
        Path uploadPath = Paths.get(uploadDir);

        if (!Files.exists(uploadPath)) {
            Files.createDirectories(uploadPath);
        }

        String fileName = UUID.randomUUID() + "_" + file.getOriginalFilename();
        Path filePath = uploadPath.resolve(fileName);

        Files.copy(file.getInputStream(), filePath);

        return "/uploads/incidents/" + fileName;
    }

    private void validateFileType(MultipartFile file) {
        String contentType = file.getContentType();
        List<String> allowedTypes = List.of("image/jpeg", "image/png", "image/jpg", "image/gif", "image/webp");

        if (contentType == null || !allowedTypes.contains(contentType)) {
            throw new RuntimeException("Invalid file type. Only images are allowed");
        }
    }

    private long calculateAverageResolutionTime(List<IncidentTicket> tickets) {
        double average = tickets.stream()
                .filter(t -> t.getResolvedAt() != null && t.getCreatedAt() != null)
                .mapToLong(t -> java.time.temporal.ChronoUnit.HOURS.between(t.getCreatedAt(), t.getResolvedAt()))
                .average()
                .orElse(0.0);
        return Math.round(average);
    }

    @lombok.Data
    @lombok.Builder
    public static class TicketStatistics {
        private int totalTickets;
        private int openTickets;
        private int inProgressTickets;
        private int resolvedTickets;
        private int closedTickets;
        private int rejectedTickets;
        private int highPriorityTickets;
        private int unassignedTickets;
        private long averageResolutionTime;
    }
}
