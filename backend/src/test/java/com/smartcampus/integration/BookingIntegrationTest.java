package com.smartcampus.integration;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.repository.FacilityRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

/**
 * Full API integration test for the booking flow.
 * Uses Flapdoodle Embedded MongoDB — no Docker required.
 */
class BookingIntegrationTest extends BaseIntegrationTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @Autowired
    private FacilityRepository facilityRepository;

    @Autowired
    private BookingRepository bookingRepository;

    private String facilityId;

    @BeforeEach
    void setUp() {
        bookingRepository.deleteAll();
        facilityRepository.deleteAll();

        Facility facility = Facility.builder()
                .name("Lab 01")
                .type("LAB")
                .status(Facility.FacilityStatus.ACTIVE)
                .capacity(50)
                .build();
        facilityId = facilityRepository.save(facility).getId();
    }

    @Test
    @WithMockUser(username = "student@test.com", roles = "USER")
    void createBooking_returnsCreated() throws Exception {
        BookingRequestDTO request = new BookingRequestDTO();
        request.setResourceId(facilityId);
        request.setStartTime(LocalDateTime.now().plusDays(2));
        request.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));
        request.setPurpose("Study Session");
        request.setAttendees(10);

        mockMvc.perform(post("/api/bookings")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.status").value("PENDING"));
    }
}
