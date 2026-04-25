package com.smartcampus.incident.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.service.TechnicianTicketService;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.util.Collections;
import java.util.Optional;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.when;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(TechnicianTicketController.class)
@AutoConfigureMockMvc
class TechnicianTicketControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private TechnicianTicketService technicianTicketService;

    @MockBean
    private com.smartcampus.auth.security.JwtUtil jwtUtil;

    @MockBean
    private com.smartcampus.auth.repository.UserRepository userRepository;

    @MockBean
    private com.smartcampus.auth.security.CustomUserDetailsService customUserDetailsService;

    @Autowired
    private ObjectMapper objectMapper;

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getAssignedTickets_Success() throws Exception {
        when(technicianTicketService.getAssignedTickets()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/technician/tickets"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getTicketById_Found() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(technicianTicketService.getAssignedTicketById("t1")).thenReturn(Optional.of(ticket));
        mockMvc.perform(get("/api/technician/tickets/t1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void getTicketById_NotFound_Returns404() throws Exception {
        when(technicianTicketService.getAssignedTicketById("missing")).thenReturn(Optional.empty());
        mockMvc.perform(get("/api/technician/tickets/missing"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void updateTicketStatus_Success() throws Exception {
        IncidentTicket ticket = IncidentTicket.builder().id("t1")
                .status(IncidentTicket.TicketStatus.IN_PROGRESS).build();
        when(technicianTicketService.updateTicketStatus(anyString(), any(), any()))
                .thenReturn(ticket);

        mockMvc.perform(put("/api/technician/tickets/t1/status")
                .param("status", "IN_PROGRESS")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "TECHNICIAN")
    void addComment_Success() throws Exception {
        AddCommentDTO dto = new AddCommentDTO();
        dto.setContent("Working on it");
        dto.setCommentedBy("tech@test.com");
        dto.setCommentedByRole("TECHNICIAN");

        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(technicianTicketService.addComment(anyString(), any())).thenReturn(ticket);

        mockMvc.perform(post("/api/technician/tickets/t1/comment")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }
}
