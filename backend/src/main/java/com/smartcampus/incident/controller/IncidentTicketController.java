package com.smartcampus.incidents.controller;

import com.smartcampus.incidents.dto.AddCommentDTO;
import com.smartcampus.incidents.dto.CreateIncidentTicketDTO;
import com.smartcampus.incidents.dto.IncidentTicketResponseDTO;
import com.smartcampus.incidents.model.IncidentTicket;
import com.smartcampus.incidents.service.IncidentTicketService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/incidents")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000", "http://localhost:5174"})
public class IncidentTicketController {

    private final IncidentTicketService incidentService;

    // ==================== GET ENDPOINTS ====================

    /**
     * GET /incidents - Retrieve all incident tickets
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping
    public ResponseEntity<?> getAllTickets(
            @RequestParam(required = false) String status,
            @RequestParam(required = false) String facility,
            @RequestParam(required = false) String priority) {
        try {
            List<IncidentTicket> tickets;

            if (status != null) {
                tickets = incidentService.getTicketsByStatus(IncidentTicket.TicketStatus.valueOf(status));
            } else if (facility != null) {
                tickets = incidentService.getTicketsByFacility(facility);
            } else if (priority != null) {
                tickets = incidentService.getTicketsByPriority(IncidentTicket.TicketPriority.valueOf(priority));
            } else {
                tickets = incidentService.getAllTickets();
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Tickets retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).toList(),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving tickets: " + e.getMessage()));
        }
    }

    /**
     * GET /incidents/{id} - Get specific ticket
     * HTTP Method: GET | Status: 200 OK or 404 NOT FOUND
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getTicketById(@PathVariable String id) {
        try {
            return incidentService.getTicketById(id)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Ticket retrieved successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving ticket: " + e.getMessage()));
        }
    }

    /**
     * GET /incidents/open - Get open tickets
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping("/filter/open")
    public ResponseEntity<?> getOpenTickets() {
        try {
            List<IncidentTicket> tickets = incidentService.getOpenTickets();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Open tickets retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).toList(),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving open tickets"));
        }
    }

    /**
     * GET /incidents/unassigned - Get unassigned tickets
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping("/filter/unassigned")
    public ResponseEntity<?> getUnassignedTickets() {
        try {
            List<IncidentTicket> tickets = incidentService.getUnassignedTickets();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Unassigned tickets retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).toList(),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving unassigned tickets"));
        }
    }

    /**
     * GET /incidents/technician/{id} - Get tickets assigned to technician
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping("/technician/{technicianId}")
    public ResponseEntity<?> getTechnicianTickets(@PathVariable String technicianId) {
        try {
            List<IncidentTicket> tickets = incidentService.getTechnicianTickets(technicianId);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Technician tickets retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).toList(),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving technician tickets"));
        }
    }

    /**
     * GET /incidents/search - Search tickets by keyword
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping("/search/by-keyword")
    public ResponseEntity<?> searchTickets(@RequestParam String keyword) {
        try {
            List<IncidentTicket> tickets = incidentService.searchTickets(keyword);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Search results retrieved successfully",
                    "data", tickets.stream().map(IncidentTicketResponseDTO::fromEntity).toList(),
                    "count", tickets.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error searching tickets"));
        }
    }

    /**
     * GET /incidents/statistics - Get ticket statistics
     * HTTP Method: GET | Status: 200 OK
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            var stats = incidentService.getStatistics();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error retrieving statistics"));
        }
    }

    // ==================== POST ENDPOINTS ====================

    /**
     * POST /incidents - Create new incident ticket
     * HTTP Method: POST | Status: 201 CREATED
     */
    @PostMapping
    public ResponseEntity<?> createTicket(@Valid @RequestBody CreateIncidentTicketDTO request) {
        try {
            IncidentTicket ticket = incidentService.createIncidentTicket(request);
            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Incident ticket created successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error creating ticket: " + e.getMessage()));
        }
    }

    /**
     * POST /incidents/{id}/attachments - Add attachment to ticket
     * HTTP Method: POST | Status: 200 OK or 400 BAD REQUEST
     */
    @PostMapping("/{id}/attachments")
    public ResponseEntity<?> addAttachment(
            @PathVariable String id,
            @RequestParam("file") MultipartFile file,
            @RequestParam("uploadedBy") String uploadedBy) {
        try {
            return incidentService.addAttachment(id, file, uploadedBy)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Attachment uploaded successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (RuntimeException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    /**
     * POST /incidents/{id}/comments - Add comment to ticket
     * HTTP Method: POST | Status: 200 OK
     */
    @PostMapping("/{id}/comments")
    public ResponseEntity<?> addComment(
            @PathVariable String id,
            @Valid @RequestBody AddCommentDTO commentRequest) {
        try {
            return incidentService.addComment(id, commentRequest)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Comment added successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error adding comment: " + e.getMessage()));
        }
    }

    // ==================== PUT ENDPOINTS ====================

    /**
     * PUT /incidents/{id} - Update ticket details
     * HTTP Method: PUT | Status: 200 OK or 404 NOT FOUND
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateTicket(
            @PathVariable String id,
            @Valid @RequestBody CreateIncidentTicketDTO request) {
        try {
            return incidentService.updateTicket(id, request)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Ticket updated successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error updating ticket: " + e.getMessage()));
        }
    }

    /**
     * PUT /incidents/{ticketId}/comments/{commentId} - Update comment
     * HTTP Method: PUT | Status: 200 OK
     */
    @PutMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> updateComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String newContent,
            @RequestParam String userId) {
        try {
            return incidentService.updateComment(ticketId, commentId, newContent, userId)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Comment updated successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error updating comment"));
        }
    }

    // ==================== PATCH ENDPOINTS ====================

    /**
     * PATCH /incidents/{id}/status - Update ticket status
     * HTTP Method: PATCH | Status: 200 OK
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateStatus(
            @PathVariable String id,
            @RequestParam IncidentTicket.TicketStatus status,
            @RequestParam(required = false) String resolutionNotes,
            @RequestParam(required = false) String rejectionReason) {
        try {
            return incidentService.updateTicketStatus(id, status, resolutionNotes, rejectionReason)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Ticket status updated successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error updating status"));
        }
    }

    /**
     * PATCH /incidents/{id}/assign - Assign technician to ticket
     * HTTP Method: PATCH | Status: 200 OK
     */
    @PatchMapping("/{id}/assign")
    public ResponseEntity<?> assignTechnician(
            @PathVariable String id,
            @RequestParam String technicianId,
            @RequestParam String technicianName) {
        try {
            return incidentService.assignTechnician(id, technicianId, technicianName)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Technician assigned successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error assigning technician"));
        }
    }

    /**
     * PATCH /incidents/{id}/unassign - Unassign technician from ticket
     * HTTP Method: PATCH | Status: 200 OK
     */
    @PatchMapping("/{id}/unassign")
    public ResponseEntity<?> unassignTechnician(@PathVariable String id) {
        try {
            return incidentService.unassignTechnician(id)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Technician unassigned successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error unassigning technician"));
        }
    }

    // ==================== DELETE ENDPOINTS ====================

    /**
     * DELETE /incidents/{id} - Delete ticket
     * HTTP Method: DELETE | Status: 204 NO CONTENT or 404 NOT FOUND
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteTicket(@PathVariable String id) {
        try {
            if (incidentService.deleteTicket(id)) {
                return ResponseEntity.noContent().build();
            }
            return ResponseEntity.status(HttpStatus.NOT_FOUND)
                    .body(Map.of("success", false, "message", "Ticket not found"));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of("success", false, "message", "Error deleting ticket"));
        }
    }

    /**
     * DELETE /incidents/{ticketId}/attachments/{attachmentId} - Remove attachment
     * HTTP Method: DELETE | Status: 200 OK
     */
    @DeleteMapping("/{ticketId}/attachments/{attachmentId}")
    public ResponseEntity<?> removeAttachment(
            @PathVariable String ticketId,
            @PathVariable String attachmentId) {
        try {
            return incidentService.removeAttachment(ticketId, attachmentId)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Attachment removed successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error removing attachment"));
        }
    }

    /**
     * DELETE /incidents/{ticketId}/comments/{commentId} - Delete comment
     * HTTP Method: DELETE | Status: 200 OK
     */
    @DeleteMapping("/{ticketId}/comments/{commentId}")
    public ResponseEntity<?> deleteComment(
            @PathVariable String ticketId,
            @PathVariable String commentId,
            @RequestParam String userId) {
        try {
            return incidentService.deleteComment(ticketId, commentId, userId)
                    .map(ticket -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Comment deleted successfully",
                            "data", IncidentTicketResponseDTO.fromEntity(ticket)
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of("success", false, "message", "Ticket not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of("success", false, "message", "Error deleting comment"));
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of("success", false, "message", "Invalid input: " + e.getMessage()));
    }
}
