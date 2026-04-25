package com.smartcampus.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.incident.dto.CreateIncidentTicketDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.mock.web.MockMultipartFile;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.multipart;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full API integration test for the incident ticket flow.
 * Uses Flapdoodle Embedded MongoDB — no Docker required.
 */
class TicketIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private IncidentTicketRepository ticketRepository;

    @BeforeEach
    void setUp() {
        ticketRepository.deleteAll();
    }

    @Test
    @WithMockUser(username = "reporter@test.com", roles = "USER")
    void createTicket_returnsCreated() throws Exception {
        CreateIncidentTicketDTO dto = new CreateIncidentTicketDTO();
        dto.setFacilityId("fac-1");
        dto.setFacilityName("Gym");
        dto.setTitle("Broken Treadmill");
        dto.setCategory("EQUIPMENT");
        dto.setPriority(IncidentTicket.TicketPriority.MEDIUM);

        MockMultipartFile jsonPart = new MockMultipartFile(
                "incident", "", MediaType.APPLICATION_JSON_VALUE,
                objectMapper.writeValueAsBytes(dto));

        mockMvc.perform(multipart("/api/incidents").file(jsonPart))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("OPEN"))
                .andExpect(jsonPath("$.title").value("Broken Treadmill"));
    }
}
