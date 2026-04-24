package com.smartcampus.incident.service;

import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.dto.CreateIncidentTicketDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import org.springframework.web.multipart.MultipartFile;

import java.util.List;
import java.util.Map;
import java.util.Optional;

public interface IncidentTicketService {

    List<IncidentTicket> getAllTickets();

    List<IncidentTicket> getTicketsByStatus(IncidentTicket.TicketStatus status);

    List<IncidentTicket> getTicketsByFacility(String facilityId);

    List<IncidentTicket> getTicketsByPriority(IncidentTicket.TicketPriority priority);

    Optional<IncidentTicket> getTicketById(String id);

    List<IncidentTicket> getOpenTickets();

    List<IncidentTicket> getUnassignedTickets();

    List<IncidentTicket> getTechnicianTickets(String technicianId);

    List<IncidentTicket> searchTickets(String keyword);

    Map<String, Object> getStatistics();

    IncidentTicket createIncidentTicket(CreateIncidentTicketDTO request, MultipartFile[] files);

    Optional<IncidentTicket> addAttachment(String id, MultipartFile file, String uploadedBy);

    Optional<IncidentTicket> addComment(String id, AddCommentDTO commentRequest);

    Optional<IncidentTicket> updateTicket(String id, CreateIncidentTicketDTO request);

    Optional<IncidentTicket> updateComment(String ticketId, String commentId, String newContent, String userId);

    Optional<IncidentTicket> updateTicketStatus(String id, IncidentTicket.TicketStatus status, String resolutionNotes, String rejectionReason);

    Optional<IncidentTicket> assignTechnician(String id, String technicianId, String technicianName);

    Optional<IncidentTicket> unassignTechnician(String id);

    boolean deleteTicket(String id);

    Optional<IncidentTicket> removeAttachment(String ticketId, String attachmentId);

    Optional<IncidentTicket> deleteComment(String ticketId, String commentId, String userId);
}
