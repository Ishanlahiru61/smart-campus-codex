package com.smartcampus.booking.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.service.BookingService;
import com.smartcampus.config.TestSecurityConfig;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.context.annotation.Import;
import org.springframework.http.MediaType;
import org.springframework.security.test.context.support.WithMockUser;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Collections;

import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;
import static org.springframework.security.test.web.servlet.request.SecurityMockMvcRequestPostProcessors.csrf;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(BookingController.class)
@Import(TestSecurityConfig.class)
class BookingControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @MockBean
    private BookingService bookingService;

    @Autowired
    private ObjectMapper objectMapper;

    // ===================== POST =====================

    @Test
    @WithMockUser(roles = "USER")
    void createBooking_Success() throws Exception {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId("f1");
        dto.setStartTime(LocalDateTime.now().plusDays(1));
        dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setPurpose("Project Discussion");
        dto.setAttendees(5);

        Booking booking = Booking.builder().id("b1").resourceId("f1").build();
        when(bookingService.createBooking(any())).thenReturn(booking);

        mockMvc.perform(post("/api/bookings")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isCreated())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== GET =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllBookings_Success() throws Exception {
        when(bookingService.getAllBookings()).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getBookingById_Success() throws Exception {
        Booking booking = Booking.builder().id("b1").build();
        when(bookingService.getBookingById("b1")).thenReturn(booking);
        mockMvc.perform(get("/api/bookings/b1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void getBookingsByUserId_Success() throws Exception {
        when(bookingService.getBookingsByUserId("u1")).thenReturn(Collections.emptyList());
        mockMvc.perform(get("/api/bookings/user/u1"))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== PUT =====================

    @Test
    @WithMockUser(roles = "USER")
    void updateBooking_Success() throws Exception {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId("f1");
        dto.setStartTime(LocalDateTime.now().plusDays(2));
        dto.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));
        dto.setPurpose("Updated purpose");
        dto.setAttendees(3);

        Booking booking = Booking.builder().id("b1").build();
        when(bookingService.updateBooking(anyString(), any())).thenReturn(booking);

        mockMvc.perform(put("/api/bookings/b1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== PATCH =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void approveBooking_Success() throws Exception {
        Booking booking = Booking.builder().id("b1").status(BookingStatus.APPROVED).build();
        when(bookingService.approveBooking("b1")).thenReturn(booking);

        mockMvc.perform(patch("/api/bookings/b1/approve").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void rejectBooking_Success() throws Exception {
        BookingStatusUpdateDTO dto = new BookingStatusUpdateDTO();
        dto.setReason("Facility unavailable");

        Booking booking = Booking.builder().id("b1").status(BookingStatus.REJECTED).build();
        when(bookingService.rejectBooking(anyString(), any())).thenReturn(booking);

        mockMvc.perform(patch("/api/bookings/b1/reject")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void cancelBooking_Success() throws Exception {
        Booking booking = Booking.builder().id("b1").status(BookingStatus.CANCELLED).build();
        when(bookingService.cancelBooking("b1")).thenReturn(booking);

        mockMvc.perform(patch("/api/bookings/b1/cancel").with(csrf()))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    @Test
    @WithMockUser(roles = "USER")
    void rescheduleBooking_Success() throws Exception {
        BookingRescheduleDTO dto = new BookingRescheduleDTO();
        dto.setStartTime(LocalDateTime.now().plusDays(3));
        dto.setEndTime(LocalDateTime.now().plusDays(3).plusHours(2));

        Booking booking = Booking.builder().id("b1").build();
        when(bookingService.rescheduleBooking(anyString(), any())).thenReturn(booking);

        mockMvc.perform(patch("/api/bookings/b1/reschedule")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.success").value(true));
    }

    // ===================== DELETE =====================

    @Test
    @WithMockUser(roles = "ADMIN")
    void deleteBooking_Success() throws Exception {
        doNothing().when(bookingService).deleteBooking("b1");
        mockMvc.perform(delete("/api/bookings/b1").with(csrf()))
                .andExpect(status().isNoContent());
    }

    // ===================== NEGATIVE TEST CASES =====================

    @Test
    @WithMockUser(roles = "USER")
    void createBooking_ThrowsException_ReturnsBadRequest() throws Exception {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId("f1");
        dto.setStartTime(LocalDateTime.now().plusDays(1));
        dto.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        dto.setPurpose("Project Discussion");
        dto.setAttendees(5);

        when(bookingService.createBooking(any())).thenThrow(new IllegalArgumentException("Invalid time"));

        mockMvc.perform(post("/api/bookings")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest())
                .andExpect(jsonPath("$.success").value(false));
    }

    @Test
    @WithMockUser(roles = "ADMIN")
    void getAllBookings_ThrowsException_Returns500() throws Exception {
        when(bookingService.getAllBookings()).thenThrow(new RuntimeException("Error"));
        mockMvc.perform(get("/api/bookings"))
                .andExpect(status().isInternalServerError());
    }

    @Test
    @WithMockUser(roles = "USER")
    void getBookingById_ThrowsException_Returns404() throws Exception {
        when(bookingService.getBookingById("b1")).thenThrow(new com.smartcampus.exception.ResourceNotFoundException("Not found"));
        mockMvc.perform(get("/api/bookings/b1"))
                .andExpect(status().isNotFound());
    }

    @Test
    @WithMockUser(roles = "USER")
    void updateBooking_ThrowsException_ReturnsBadRequest() throws Exception {
        BookingRequestDTO dto = new BookingRequestDTO();
        dto.setResourceId("f1");
        dto.setStartTime(LocalDateTime.now().plusDays(2));
        dto.setEndTime(LocalDateTime.now().plusDays(2).plusHours(1));

        when(bookingService.updateBooking(anyString(), any())).thenThrow(new RuntimeException("Error"));

        mockMvc.perform(put("/api/bookings/b1")
                .with(csrf())
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(dto)))
                .andExpect(status().isBadRequest());
    }
}
