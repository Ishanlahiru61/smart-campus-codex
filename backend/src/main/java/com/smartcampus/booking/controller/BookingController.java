package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;
import org.springframework.http.ResponseEntity;
import java.util.Map;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // 1. CREATE BOOKING
    @PostMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        Booking booking = bookingService.createBooking(dto);
        return ResponseEntity.status(HttpStatus.CREATED).body(Map.of(
            "success", true,
            "message", "Booking created successfully",
            "data", booking
        ));
    }

    // 2. GET ALL BOOKINGS
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getAllBookings() {
        List<Booking> bookings = bookingService.getAllBookings();
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Bookings retrieved successfully",
            "data", bookings,
            "count", bookings.size()
        ));
    }

    // 3. GET BOOKING BY ID
    @GetMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getBookingById(@PathVariable String bookingId) {
        Booking booking = bookingService.getBookingById(bookingId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking retrieved successfully",
            "data", booking
        ));
    }

    // 4. GET BOOKINGS BY USER ID
    @GetMapping("/user/{userId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> getBookingsByUserId(@PathVariable String userId) {
        List<Booking> bookings = bookingService.getBookingsByUserId(userId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "User bookings retrieved successfully",
            "data", bookings,
            "count", bookings.size()
        ));
    }

    // 5. UPDATE BOOKING
    @PutMapping("/{bookingId}")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> updateBooking(@PathVariable String bookingId,
                                 @Valid @RequestBody BookingRequestDTO dto) {
        Booking booking = bookingService.updateBooking(bookingId, dto);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking updated successfully",
            "data", booking
        ));
    }

    // 6. APPROVE BOOKING
    @PatchMapping("/{bookingId}/approve")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> approveBooking(@PathVariable String bookingId) {
        Booking booking = bookingService.approveBooking(bookingId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking approved successfully",
            "data", booking
        ));
    }

    // 7. REJECT BOOKING
    @PatchMapping("/{bookingId}/reject")
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> rejectBooking(@PathVariable String bookingId,
                                 @Valid @RequestBody BookingStatusUpdateDTO dto) {
        Booking booking = bookingService.rejectBooking(bookingId, dto);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking rejected successfully",
            "data", booking
        ));
    }

    // 8. CANCEL BOOKING
    @PatchMapping("/{bookingId}/cancel")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> cancelBooking(@PathVariable String bookingId) {
        Booking booking = bookingService.cancelBooking(bookingId);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking cancelled successfully",
            "data", booking
        ));
    }

    // 9. RESCHEDULE BOOKING
    @PatchMapping("/{bookingId}/reschedule")
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
    public ResponseEntity<?> rescheduleBooking(@PathVariable String bookingId,
                                     @Valid @RequestBody BookingRescheduleDTO dto) {
        Booking booking = bookingService.rescheduleBooking(bookingId, dto);
        return ResponseEntity.ok(Map.of(
            "success", true,
            "message", "Booking rescheduled successfully",
            "data", booking
        ));
    }

    // 10. DELETE BOOKING
    @DeleteMapping("/{bookingId}")
    @PreAuthorize("hasRole('ADMIN')")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String bookingId) {
        bookingService.deleteBooking(bookingId);
    }
}