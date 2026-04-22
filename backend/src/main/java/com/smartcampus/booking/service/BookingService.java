package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;

import java.util.List;

public interface BookingService {

    Booking createBooking(BookingRequestDTO dto);

    List<Booking> getAllBookings();

    Booking getBookingById(String bookingId);

    List<Booking> getBookingsByUserId(String userId);

    Booking updateBooking(String bookingId, BookingRequestDTO dto);

    Booking approveBooking(String bookingId);

    Booking rejectBooking(String bookingId, BookingStatusUpdateDTO dto);

    Booking cancelBooking(String bookingId);

    Booking rescheduleBooking(String bookingId, BookingRescheduleDTO dto);

    void deleteBooking(String bookingId);
}