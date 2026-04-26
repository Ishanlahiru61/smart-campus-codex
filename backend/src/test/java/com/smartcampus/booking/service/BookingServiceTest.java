package com.smartcampus.booking.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.exception.InvalidBookingException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.repository.FacilityRepository;
import com.smartcampus.notification.service.NotificationService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.time.LocalDateTime;
import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class BookingServiceTest {

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private FacilityRepository facilityRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private BookingServiceImpl bookingService;

    private Facility activeFacility;
    private BookingRequestDTO validRequest;

    @BeforeEach
    void setUp() {
        activeFacility = Facility.builder()
                .id("fac1")
                .name("Conference Room")
                .status(Facility.FacilityStatus.ACTIVE)
                .build();

        validRequest = new BookingRequestDTO();
        validRequest.setResourceId("fac1");
        validRequest.setStartTime(LocalDateTime.now().plusDays(1));
        validRequest.setEndTime(LocalDateTime.now().plusDays(1).plusHours(2));
        validRequest.setPurpose("Project Meeting");
        validRequest.setAttendees(5);

        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void createBooking_Success() {
        when(facilityRepository.findById("fac1")).thenReturn(Optional.of(activeFacility));
        when(bookingRepository.findByResourceId("fac1")).thenReturn(Collections.emptyList());
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("test-user");
        when(userRepository.findByRolesContaining("ROLE_ADMIN")).thenReturn(Collections.emptyList());
        
        Booking savedBooking = Booking.builder()
                .id("booking1")
                .resourceId("fac1")
                .userId("test-user")
                .status(BookingStatus.PENDING)
                .build();
        when(bookingRepository.save(any(Booking.class))).thenReturn(savedBooking);

        Booking result = bookingService.createBooking(validRequest);

        assertNotNull(result);
        assertEquals(BookingStatus.PENDING, result.getStatus());
        verify(bookingRepository).save(any(Booking.class));
    }

    @Test
    void createBooking_InvalidTimeRange_ThrowsException() {
        validRequest.setEndTime(validRequest.getStartTime().minusHours(1));
        assertThrows(InvalidBookingException.class, () -> bookingService.createBooking(validRequest));
    }

    @Test
    void createBooking_FacilityInactive_ThrowsException() {
        activeFacility.setStatus(Facility.FacilityStatus.OUT_OF_SERVICE);
        when(facilityRepository.findById("fac1")).thenReturn(Optional.of(activeFacility));
        assertThrows(InvalidBookingException.class, () -> bookingService.createBooking(validRequest));
    }

    @Test
    void approveBooking_Success() {
        Booking pendingBooking = Booking.builder()
                .id("b1")
                .userId("user1")
                .status(BookingStatus.PENDING)
                .build();
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(pendingBooking));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user1");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        Booking result = bookingService.approveBooking("b1");

        assertEquals(BookingStatus.APPROVED, result.getStatus());
    }

    @Test
    void rejectBooking_Success() {
        Booking pendingBooking = Booking.builder()
                .id("b1")
                .userId("user1")
                .status(BookingStatus.PENDING)
                .build();
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(pendingBooking));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user1");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        BookingStatusUpdateDTO updateDto = new BookingStatusUpdateDTO();
        updateDto.setReason("Not available");

        Booking result = bookingService.rejectBooking("b1", updateDto);

        assertEquals(BookingStatus.REJECTED, result.getStatus());
        assertEquals("Not available", result.getRejectionReason());
    }

    @Test
    void cancelBooking_Success() {
        Booking approvedBooking = Booking.builder()
                .id("b1")
                .userId("user1")
                .status(BookingStatus.APPROVED)
                .build();
        
        when(bookingRepository.findById("b1")).thenReturn(Optional.of(approvedBooking));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user1");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(bookingRepository.save(any(Booking.class))).thenAnswer(i -> i.getArguments()[0]);

        Booking result = bookingService.cancelBooking("b1");

        assertEquals(BookingStatus.CANCELLED, result.getStatus());
    }

    @Test
    void getAllBookings_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getAuthorities()).thenReturn((java.util.Collection) java.util.Collections.singletonList(new org.springframework.security.core.authority.SimpleGrantedAuthority("ROLE_ADMIN")));
        when(bookingRepository.findAll()).thenReturn(java.util.Arrays.asList(new Booking(), new Booking()));
        List<Booking> result = bookingService.getAllBookings();
        assertEquals(2, result.size());
    }

    @Test
    void getBookingsByUserId_Success() {
        when(bookingRepository.findByUserId("user1")).thenReturn(Collections.emptyList());
        var result = bookingService.getBookingsByUserId("user1");
        assertNotNull(result);
    }

    @Test
    void deleteBooking_Success() {
        when(bookingRepository.existsById("b1")).thenReturn(true);
        doNothing().when(bookingRepository).deleteById("b1");
        bookingService.deleteBooking("b1");
        verify(bookingRepository).deleteById("b1");
    }
}
