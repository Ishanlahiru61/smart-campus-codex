package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.entity.Booking;

import java.util.List;

public interface BookingService {

    Booking createBooking(BookingRequestDTO dto, String userId);

    List<Booking> getUserBookings(String userId);

    List<Booking> getAllBookings();

    Booking updateBooking(String id, BookingRequestDTO dto);

    Booking updateStatus(String id, String status);

    Booking cancelBooking(String id);

    void deleteBooking(String id);
}