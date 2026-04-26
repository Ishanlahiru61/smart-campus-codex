package com.smartcampus.facility.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.facility.dto.FacilityRequestDTO;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.service.FacilityService;
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

@WebMvcTest(FacilityController.class)
@AutoConfigureMockMvc
class FacilityControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private FacilityService facilityService;

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

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllFacilities_Success() throws Exception {
        when(facilityService.getAllFacilities()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/facilities"))
                .andDo(org.springframework.test.web.servlet.result.MockMvcResultHandlers.print())
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createFacility_Success() throws Exception {
        FacilityRequestDTO dto = new FacilityRequestDTO();
        dto.setName("Lab 01");
        dto.setType("Laboratory");
        dto.setCapacity(30);
        dto.setLocation("Building A");
        dto.setStatus(Facility.FacilityStatus.ACTIVE);
        
        Facility facility = Facility.builder().id("f1").name("Lab 01").build();
        when(facilityService.createFacility(any(), anyString())).thenReturn(facility);

        mockMvc.perform(multipart("/facilities")
                .file("facility", objectMapper.writeValueAsString(dto).getBytes())
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.data.name").value("Lab 01"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getFacilityById_Success() throws Exception {
        Facility facility = Facility.builder().id("f1").name("Lab 01").build();
        when(facilityService.getFacilityById("f1")).thenReturn(Optional.of(facility));

        mockMvc.perform(get("/facilities/f1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.data.name").value("Lab 01"));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void updateFacilityStatus_Success() throws Exception {
        Facility facility = Facility.builder().id("f1").status(Facility.FacilityStatus.MAINTENANCE).build();
        when(facilityService.updateFacilityStatus(anyString(), any(), anyString())).thenReturn(Optional.of(facility));

        mockMvc.perform(patch("/facilities/f1/status")
                .param("status", "MAINTENANCE")
                .with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteFacility_Success() throws Exception {
        when(facilityService.deleteFacility("f1")).thenReturn(true);
        mockMvc.perform(delete("/facilities/f1").with(csrf()))
                .andExpect(status().isNoContent());
    }
    // ===================== NEGATIVE TEST CASES =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllFacilities_ThrowsException_Returns500() throws Exception {
        when(facilityService.getAllFacilities()).thenThrow(new RuntimeException("Database error"));
        mockMvc.perform(get("/facilities"))
                .andExpect(status().isInternalServerError())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getFacilityById_ThrowsException_Returns404() throws Exception {
        when(facilityService.getFacilityById("f1")).thenThrow(new com.smartcampus.exception.ResourceNotFoundException("Not found"));
        mockMvc.perform(get("/facilities/f1"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void createFacility_ThrowsException_ReturnsBadRequest() throws Exception {
        FacilityRequestDTO dto = new FacilityRequestDTO();
        dto.setName("Lab 01");
        dto.setType("Laboratory");
        dto.setCapacity(30);
        dto.setLocation("Building A");
        dto.setStatus(com.smartcampus.facility.entity.Facility.FacilityStatus.ACTIVE);
        when(facilityService.createFacility(any(), any())).thenThrow(new IllegalArgumentException("Invalid"));
        mockMvc.perform(multipart("/facilities")
                .file("facility", objectMapper.writeValueAsString(dto).getBytes())
                .with(csrf())
                .contentType(MediaType.MULTIPART_FORM_DATA))
                .andExpect(status().isBadRequest());
    }
}
