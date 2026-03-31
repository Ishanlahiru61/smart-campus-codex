package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.entity.*;
import com.smartcampus.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public Booking createBooking(BookingRequestDTO dto, String userId) {

        // Validate time logic
        if (dto.startTime.isAfter(dto.endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }

        // Conflict check
        var conflicts = bookingRepository
                .findByResourceIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
                        dto.resourceId,
                        dto.endTime,
                        dto.startTime
                );

        if (!conflicts.isEmpty()) {
            throw new IllegalArgumentException("Time slot already booked");
        }

        Booking booking = Booking.builder()
                .resourceId(dto.resourceId)
                .userId(userId)
                .startTime(dto.startTime)
                .endTime(dto.endTime)
                .purpose(dto.purpose)
                .attendees(dto.attendees)
                .status(BookingStatus.PENDING)
                .build();

        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getUserBookings(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking updateStatus(String id, String status) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.valueOf(status));
        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(String id) {
        Booking booking = bookingRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Booking not found"));

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }
}