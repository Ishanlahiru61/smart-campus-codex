package com.smartcampus.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.dto.CreateIncidentTicketDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import com.smartcampus.incident.service.IncidentTicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Map;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(IncidentTicketController.class)
@AutoConfigureMockMvc
class IncidentTicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private IncidentTicketService incidentTicketService;

    @MockBean
    private IncidentTicketRepository incidentTicketRepository;


    @MockBean
    private com.smartcampus.auth.security.JwtUtil jwtUtil;

    @MockBean
    private com.smartcampus.auth.repository.UserRepository userRepository;

    @MockBean
    private com.smartcampus.auth.security.CustomUserDetailsService customUserDetailsService;

    @MockBean
    private com.smartcampus.service.CloudinaryService cloudinaryService;

    @Autowired
    private ObjectMapper objectMapper;

    // ===================== GET ENDPOINTS =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTickets_NoFilter_Success() throws Exception {
        when(incidentTicketService.getAllTickets()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTickets_WithStatusFilter_Success() throws Exception {
        when(incidentTicketService.getTicketsByStatus(IncidentTicket.TicketStatus.OPEN))
                .thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents").param("status", "OPEN"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTickets_WithFacilityFilter_Success() throws Exception {
        when(incidentTicketService.getTicketsByFacility("f1")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents").param("facility", "f1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTickets_WithPriorityFilter_Success() throws Exception {
        when(incidentTicketService.getTicketsByPriority(IncidentTicket.TicketPriority.HIGH))
                .thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents").param("priority", "HIGH"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTicketById_Found() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(incidentTicketService.getTicketById("t1")).thenReturn(Optional.of(ticket));
        mockMvc.perform(get("/incidents/t1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTicketById_NotFound_Returns404() throws Exception {
        when(incidentTicketService.getTicketById("missing")).thenReturn(Optional.empty());
        mockMvc.perform(get("/incidents/missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getOpenTickets_Success() throws Exception {
        when(incidentTicketService.getOpenTickets()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents/filter/open"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(username = "user@test.com", roles = "USER")
    void getMyTickets_Success() throws Exception {
        when(incidentTicketRepository.findByReportedBy("user@test.com")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents/filter/my"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getUnassignedTickets_Success() throws Exception {
        when(incidentTicketService.getUnassignedTickets()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents/filter/unassigned"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTechnicianTickets_Success() throws Exception {
        when(incidentTicketService.getTechnicianTickets("tech1")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents/technician/tech1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void searchTickets_Success() throws Exception {
        when(incidentTicketService.searchTickets("leak")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/incidents/search/by-keyword").param("keyword", "leak"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getStatistics_Success() throws Exception {
        when(incidentTicketService.getStatistics()).thenReturn(Map.of("total", 10L, "open", 5L));
        mockMvc.perform(get("/incidents/statistics"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== POST ENDPOINTS =====================

    @Test
    @WithMockUser(roles = "USER")
    void createTicket_Success() throws Exception {
        CreateIncidentTicketDTO dto = new CreateIncidentTicketDTO();
        dto.setFacilityId("f1");
        dto.setFacilityName("Lab 01");
        dto.setTitle("Faulty Lights");
        dto.setDescription("Lights not working in Lab 01");
        dto.setReportedBy("User");
        dto.setCategory("Electrical");
        dto.setPriority(IncidentTicket.TicketPriority.MEDIUM);

        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(incidentTicketService.createIncidentTicket(any(), any())).thenReturn(ticket);


        mockMvc.perform(multipart("/incidents")
                .file("incident", objectMapper.writeValueAsString(dto).getBytes())
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void addComment_Success() throws Exception {
        AddCommentDTO commentDTO = new AddCommentDTO();
        commentDTO.setContent("This is a test comment.");
        commentDTO.setCommentedBy("user@test.com");
        commentDTO.setCommentedByRole("USER");

        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(incidentTicketService.addComment(anyString(), any())).thenReturn(Optional.of(ticket));

        mockMvc.perform(post("/incidents/t1/comments")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(commentDTO)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== PATCH ENDPOINTS =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_Success() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").status(IncidentTicket.TicketStatus.RESOLVED).build();
        when(incidentTicketService.updateTicketStatus(anyString(), any(), any(), any()))
                .thenReturn(Optional.of(ticket));

        mockMvc.perform(patch("/incidents/t1/status")
                .param("status", "RESOLVED")
                .param("resolutionNotes", "Fixed the issue")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignTechnician_Success() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").assignedTechnician("tech1").build();
        when(incidentTicketService.assignTechnician(anyString(), anyString(), anyString()))
                .thenReturn(Optional.of(ticket));

        mockMvc.perform(patch("/incidents/t1/assign")
                .param("technicianId", "tech1")
                .param("technicianName", "Tech One")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void unassignTechnician_Success() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(incidentTicketService.unassignTechnician("t1")).thenReturn(Optional.of(ticket));

        mockMvc.perform(patch("/incidents/t1/unassign").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignTechnician_NotFound_Returns404() throws Exception {
        when(incidentTicketService.assignTechnician(anyString(), anyString(), anyString()))
                .thenReturn(Optional.empty());

        mockMvc.perform(patch("/incidents/missing/assign")
                .param("technicianId", "tech1")
                .param("technicianName", "Tech One")
                .with(csrf()))
                .andExpect(status().isNotFound());
    }

    // ===================== DELETE ENDPOINTS =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTicket_Success() throws Exception {
        when(incidentTicketService.deleteTicket("t1")).thenReturn(true);
        mockMvc.perform(delete("/incidents/t1").with(csrf()))
                .andExpect(status().isNoContent());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTicket_NotFound_Returns404() throws Exception {
        when(incidentTicketService.deleteTicket("missing")).thenReturn(false);
        mockMvc.perform(delete("/incidents/missing").with(csrf()))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "USER")
    void deleteComment_Success() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(incidentTicketService.deleteComment("t1", "c1", "user@test.com"))
                .thenReturn(Optional.of(ticket));

        mockMvc.perform(delete("/incidents/t1/comments/c1")
                .param("userId", "user@test.com")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== NEGATIVE TEST CASES (CATCH BLOCKS) =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllTickets_ThrowsException_Returns500() throws Exception {
        when(incidentTicketService.getAllTickets()).thenThrow(new RuntimeException("Database error"));
        mockMvc.perform(get("/incidents"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getTicketById_ThrowsException_Returns500() throws Exception {
        when(incidentTicketService.getTicketById("t1")).thenThrow(new RuntimeException("Error"));
        mockMvc.perform(get("/incidents/t1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateStatus_ThrowsException_Returns400() throws Exception {
        when(incidentTicketService.updateTicketStatus(anyString(), any(), any(), any()))
                .thenThrow(new RuntimeException("Error"));
        mockMvc.perform(patch("/incidents/t1/status")
                .param("status", "RESOLVED")
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void assignTechnician_ThrowsException_Returns400() throws Exception {
        when(incidentTicketService.assignTechnician(anyString(), anyString(), anyString()))
                .thenThrow(new RuntimeException("Error"));
        mockMvc.perform(patch("/incidents/t1/assign")
                .param("technicianId", "tech1")
                .param("technicianName", "Tech One")
                .with(csrf()))
                .andExpect(status().isBadRequest());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteTicket_ThrowsException_Returns500() throws Exception {
        when(incidentTicketService.deleteTicket("t1")).thenThrow(new RuntimeException("Error"));
        mockMvc.perform(delete("/incidents/t1").with(csrf()))
                .andExpect(status().isInternalServerError());
    }
}
