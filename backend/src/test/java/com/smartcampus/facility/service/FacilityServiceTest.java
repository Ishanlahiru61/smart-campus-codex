package com.smartcampus.facility.service;

import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.facility.dto.FacilityRequestDTO;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.repository.FacilityRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class FacilityServiceTest {

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private BookingRepository bookingRepository;

    @InjectMocks
    private FacilityService facilityService;

    @Test
    void createFacility_Success() {
        FacilityRequestDTO dto = new FacilityRequestDTO();
        dto.setName("Main Hall");
        dto.setCapacity(100);

        when(facilityRepository.save(any(Facility.class))).thenAnswer(i -> i.getArguments()[0]);

        Facility result = facilityService.createFacility(dto, "admin1");

        assertNotNull(result);
        assertEquals("Main Hall", result.getName());
    }

    @Test
    void deleteFacility_WithActiveBookings_ThrowsException() {
        when(facilityRepository.existsById("f1")).thenReturn(true);
        Booking activeBooking = Booking.builder().status(BookingStatus.APPROVED).build();
        when(bookingRepository.findByResourceId("f1")).thenReturn(List.of(activeBooking));

        assertThrows(IllegalStateException.class, () -> facilityService.deleteFacility("f1"));
    }

    @Test
    void getAllFacilities_Success() {
        when(facilityRepository.findAll()).thenReturn(java.util.Arrays.asList(new Facility(), new Facility()));
        List<Facility> result = facilityService.getAllFacilities();
        assertEquals(2, result.size());
    }

    @Test
    void updateFacility_Success() {
        Facility existing = Facility.builder().id("f1").name("Old Name").build();
        FacilityRequestDTO dto = new FacilityRequestDTO();
        dto.setName("New Name");
        
        when(facilityRepository.findById("f1")).thenReturn(Optional.of(existing));
        when(facilityRepository.save(any(Facility.class))).thenAnswer(i -> i.getArguments()[0]);

        Optional<Facility> result = facilityService.updateFacility("f1", dto, "admin1");

        assertTrue(result.isPresent());
        assertEquals("New Name", result.get().getName());
    }

    @Test
    void getFacilityById_Success() {
        Facility facility = Facility.builder().id("f1").build();
        when(facilityRepository.findById("f1")).thenReturn(Optional.of(facility));
        Optional<Facility> result = facilityService.getFacilityById("f1");
        assertTrue(result.isPresent());
        assertEquals("f1", result.get().getId());
    }
}
