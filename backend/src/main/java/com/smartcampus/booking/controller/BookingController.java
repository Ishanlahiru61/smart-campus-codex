package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@CrossOrigin(origins = "http://localhost:5173")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // 1. CREATE BOOKING
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking createBooking(@Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.createBooking(dto);
    }

    // 2. GET ALL BOOKINGS
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Booking> getAllBookings() {
        return bookingService.getAllBookings();
    }

    // 3. GET BOOKING BY ID
    @GetMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.OK)
    public Booking getBookingById(@PathVariable String bookingId) {
        return bookingService.getBookingById(bookingId);
    }

    // 4. GET BOOKINGS BY USER ID
    @GetMapping("/user/{userId}")
    @ResponseStatus(HttpStatus.OK)
    public List<Booking> getBookingsByUserId(@PathVariable String userId) {
        return bookingService.getBookingsByUserId(userId);
    }

    // 5. UPDATE BOOKING
    @PutMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.OK)
    public Booking updateBooking(@PathVariable String bookingId,
                                 @Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.updateBooking(bookingId, dto);
    }

    // 6. APPROVE BOOKING
    @PatchMapping("/{bookingId}/approve")
    @ResponseStatus(HttpStatus.OK)
    public Booking approveBooking(@PathVariable String bookingId) {
        return bookingService.approveBooking(bookingId);
    }

    // 7. REJECT BOOKING
    @PatchMapping("/{bookingId}/reject")
    @ResponseStatus(HttpStatus.OK)
    public Booking rejectBooking(@PathVariable String bookingId,
                                 @Valid @RequestBody BookingStatusUpdateDTO dto) {
        return bookingService.rejectBooking(bookingId, dto);
    }

    // 8. CANCEL BOOKING
    @PatchMapping("/{bookingId}/cancel")
    @ResponseStatus(HttpStatus.OK)
    public Booking cancelBooking(@PathVariable String bookingId) {
        return bookingService.cancelBooking(bookingId);
    }

    // 9. RESCHEDULE BOOKING
    @PatchMapping("/{bookingId}/reschedule")
    @ResponseStatus(HttpStatus.OK)
    public Booking rescheduleBooking(@PathVariable String bookingId,
                                     @Valid @RequestBody BookingRescheduleDTO dto) {
        return bookingService.rescheduleBooking(bookingId, dto);
    }

    // 10. DELETE BOOKING
    @DeleteMapping("/{bookingId}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void deleteBooking(@PathVariable String bookingId) {
        bookingService.deleteBooking(bookingId);
    }
}