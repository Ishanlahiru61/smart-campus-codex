package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;

    @Override
    public Booking createBooking(BookingRequestDTO dto) {
        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        checkForConflicts(
                dto.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        Booking booking = Booking.builder()
                .resourceId(dto.getResourceId())
                .userId("user1")
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .purpose(dto.getPurpose())
                .attendees(dto.getAttendees())
                .status(BookingStatus.PENDING)
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .build();

        return bookingRepository.save(booking);
    }

    @Override
    public List<Booking> getAllBookings() {
        return bookingRepository.findAll();
    }

    @Override
    public Booking getBookingById(String bookingId) {
        return bookingRepository.findById(bookingId)
                .orElseThrow(() -> new RuntimeException("Booking not found"));
    }

    @Override
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public Booking updateBooking(String bookingId, BookingRequestDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be updated");
        }

        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        checkForConflicts(
                dto.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime(),
                bookingId
        );

        booking.setResourceId(dto.getResourceId());
        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setPurpose(dto.getPurpose());
        booking.setAttendees(dto.getAttendees());

        return bookingRepository.save(booking);
    }

    @Override
    public Booking approveBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(String bookingId, BookingStatusUpdateDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new IllegalArgumentException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(dto.getReason());

        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rescheduleBooking(String bookingId, BookingRescheduleDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new IllegalArgumentException("Cancelled bookings cannot be rescheduled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new IllegalArgumentException("Rejected bookings cannot be rescheduled");
        }

        validateTimeRange(dto.getStartTime(), dto.getEndTime());

        checkForConflicts(
                booking.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime(),
                bookingId
        );

        booking.setStartTime(dto.getStartTime());
        booking.setEndTime(dto.getEndTime());
        booking.setStatus(BookingStatus.PENDING);

        return bookingRepository.save(booking);
    }

    @Override
    public void deleteBooking(String bookingId) {
        if (!bookingRepository.existsById(bookingId)) {
            throw new RuntimeException("Booking not found");
        }

        bookingRepository.deleteById(bookingId);
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new IllegalArgumentException("Start time must be before end time");
        }
    }

    private void checkForConflicts(String resourceId,
                                   LocalDateTime newStart,
                                   LocalDateTime newEnd,
                                   String currentBookingId) {

        List<Booking> bookings = bookingRepository.findByResourceId(resourceId);

        boolean hasConflict = bookings.stream()
                .filter(booking -> booking.getStatus() == BookingStatus.PENDING
                        || booking.getStatus() == BookingStatus.APPROVED)
                .filter(booking -> currentBookingId == null
                        || !booking.getId().equals(currentBookingId))
                .anyMatch(booking ->
                        newStart.isBefore(booking.getEndTime())
                                && newEnd.isAfter(booking.getStartTime())
                );

        if (hasConflict) {
            throw new IllegalArgumentException("Time slot already booked");
        }
    }
}