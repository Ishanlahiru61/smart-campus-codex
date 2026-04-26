package com.smartcampus.incident.controller;

import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.dto.IncidentTicketResponseDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.service.TechnicianTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/technician/tickets")
@RequiredArgsConstructor
@PreAuthorize("hasRole('TECHNICIAN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class TechnicianTicketController {

    private final TechnicianTicketService technicianService;

    @GetMapping
    public ResponseEntity<?> getAssignedTickets() {
        try {
            List<IncidentTicket> tickets = technicianService.getAssignedTickets();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Assigned tickets retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).collect(Collectors.toList()),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving assigned tickets"));
        }
    }

    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        try {
            return technicianService.getAssignedTicketById(id)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Ticket retrieved successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found or access denied")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving ticket"));
        }
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<?> updateTicketStatus(
            @PathVariable String id,
            @RequestParam IncidentTicket.TicketStatus status,
            @RequestParam(required = false) String resolutionNotes) {
        try {
            IncidentTicket updatedTicket = technicianService.updateTicketStatus(id, status, resolutionNotes);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Ticket status updated successfully",
                    "data", IncidentTicketResponseDTO.fromEntity(updatedTicket)
            ));
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PostMapping("/{id}/comment")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddCommentDTO commentRequest) {
        try {
            IncidentTicket updatedTicket = technicianService.addComment(id, commentRequest);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Comment added successfully",
                    "data", IncidentTicketResponseDTO.fromEntity(updatedTicket)
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}
