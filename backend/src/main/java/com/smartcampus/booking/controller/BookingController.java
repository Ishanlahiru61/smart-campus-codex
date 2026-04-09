package com.smartcampus.booking.controller;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.service.BookingService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/bookings")
@RequiredArgsConstructor
public class BookingController {

    private final BookingService bookingService;

    // CREATE BOOKING
    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public Booking create(@Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.createBooking(dto, "user1");
    }

    // GET USER BOOKINGS
    @GetMapping("/my")
    @ResponseStatus(HttpStatus.OK)
    public List<Booking> myBookings() {
        return bookingService.getUserBookings("user1");
    }

    // GET ALL BOOKINGS
    @GetMapping
    @ResponseStatus(HttpStatus.OK)
    public List<Booking> allBookings() {
        return bookingService.getAllBookings();
    }

    // UPDATE BOOKING DETAILS
    @PutMapping("/{id}")
    @ResponseStatus(HttpStatus.OK)
    public Booking updateBooking(@PathVariable String id,
                                 @Valid @RequestBody BookingRequestDTO dto) {
        return bookingService.updateBooking(id, dto);
    }

    // UPDATE STATUS
    @PutMapping("/{id}/status")
    @ResponseStatus(HttpStatus.OK)
    public Booking updateStatus(@PathVariable String id,
                               @RequestParam String status) {
        return bookingService.updateStatus(id, status);
    }

    // CANCEL BOOKING
    @PutMapping("/{id}/cancel")
    @ResponseStatus(HttpStatus.OK)
    public Booking cancel(@PathVariable String id) {
        return bookingService.cancelBooking(id);
    }

    // DELETE BOOKING
    @DeleteMapping("/{id}")
    @ResponseStatus(HttpStatus.NO_CONTENT)
    public void delete(@PathVariable String id) {
        bookingService.deleteBooking(id);
    }
}