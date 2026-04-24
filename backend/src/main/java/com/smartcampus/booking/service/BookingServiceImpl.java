package com.smartcampus.booking.service;

import com.smartcampus.booking.dto.BookingRequestDTO;
import com.smartcampus.booking.dto.BookingRescheduleDTO;
import com.smartcampus.booking.dto.BookingStatusUpdateDTO;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.exception.InvalidBookingException;
import com.smartcampus.exception.ResourceNotFoundException;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.repository.FacilityRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.core.context.SecurityContextHolder;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class BookingServiceImpl implements BookingService {

    private final BookingRepository bookingRepository;
    private final FacilityRepository facilityRepository;

    @Override
    public Booking createBooking(BookingRequestDTO dto) {
        validateTimeRange(dto.getStartTime(), dto.getEndTime());
        validateFacility(dto.getResourceId(), dto.getStartTime(), dto.getEndTime());

        checkForConflicts(
                dto.getResourceId(),
                dto.getStartTime(),
                dto.getEndTime(),
                null
        );

        String currentUser = SecurityContextHolder.getContext().getAuthentication().getName();

        Booking booking = Booking.builder()
                .resourceId(dto.getResourceId())
                .userId(currentUser)
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
        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null && auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"))) {
            return bookingRepository.findAll();
        } else if (auth != null) {
            return bookingRepository.findByUserId(auth.getName());
        }
        return List.of();
    }

    @Override
    public Booking getBookingById(String bookingId) {
        Booking booking = bookingRepository.findById(bookingId)
                .orElseThrow(() -> new ResourceNotFoundException("Booking not found"));

        var auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth != null) {
            boolean isAdmin = auth.getAuthorities().stream().anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
            if (!isAdmin && !booking.getUserId().equals(auth.getName())) {
                throw new AccessDeniedException("Access denied: You do not own this booking");
            }
        }

        return booking;
    }

    @Override
    public List<Booking> getBookingsByUserId(String userId) {
        return bookingRepository.findByUserId(userId);
    }

    @Override
    public Booking updateBooking(String bookingId, BookingRequestDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be updated");
        }

        validateTimeRange(dto.getStartTime(), dto.getEndTime());
        validateFacility(dto.getResourceId(), dto.getStartTime(), dto.getEndTime());

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
            throw new InvalidBookingException("Only pending bookings can be approved");
        }

        booking.setStatus(BookingStatus.APPROVED);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rejectBooking(String bookingId, BookingStatusUpdateDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() != BookingStatus.PENDING) {
            throw new InvalidBookingException("Only pending bookings can be rejected");
        }

        booking.setStatus(BookingStatus.REJECTED);
        booking.setRejectionReason(dto.getReason());

        return bookingRepository.save(booking);
    }

    @Override
    public Booking cancelBooking(String bookingId) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Booking is already cancelled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new InvalidBookingException("Rejected bookings cannot be cancelled");
        }

        booking.setStatus(BookingStatus.CANCELLED);
        return bookingRepository.save(booking);
    }

    @Override
    public Booking rescheduleBooking(String bookingId, BookingRescheduleDTO dto) {
        Booking booking = getBookingById(bookingId);

        if (booking.getStatus() == BookingStatus.CANCELLED) {
            throw new InvalidBookingException("Cancelled bookings cannot be rescheduled");
        }

        if (booking.getStatus() == BookingStatus.REJECTED) {
            throw new InvalidBookingException("Rejected bookings cannot be rescheduled");
        }

        validateTimeRange(dto.getStartTime(), dto.getEndTime());
        validateFacility(booking.getResourceId(), dto.getStartTime(), dto.getEndTime());

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
            throw new ResourceNotFoundException("Booking not found");
        }

        bookingRepository.deleteById(bookingId);
    }

    private void validateTimeRange(LocalDateTime startTime, LocalDateTime endTime) {
        if (!startTime.isBefore(endTime)) {
            throw new InvalidBookingException("Start time must be before end time");
        }
    }

    private void validateFacility(String resourceId, LocalDateTime start, LocalDateTime end) {
        Facility facility = facilityRepository.findById(resourceId)
                .orElseThrow(() -> new ResourceNotFoundException("Facility not found with ID: " + resourceId));

        if (facility.getStatus() != Facility.FacilityStatus.ACTIVE) {
            throw new InvalidBookingException("Facility is not active and cannot be booked");
        }

        if (facility.getAvailabilityWindows() != null && !facility.getAvailabilityWindows().isEmpty()) {
            boolean isWithinWindow = facility.getAvailabilityWindows().stream()
                    .anyMatch(window -> isWithinAvailabilityWindow(start, end, window));

            if (!isWithinWindow) {
                throw new InvalidBookingException("Requested time is outside the facility's availability windows");
            }
        }
    }

    private boolean isWithinAvailabilityWindow(LocalDateTime start, LocalDateTime end, Facility.AvailabilityWindow window) {
        String dayOfWeek = start.getDayOfWeek().name();
        if (!dayOfWeek.equalsIgnoreCase(window.getDayOfWeek())) {
            return false;
        }
        if (!end.getDayOfWeek().name().equalsIgnoreCase(window.getDayOfWeek())) {
            return false;
        }

        java.time.LocalTime windowStart = java.time.LocalTime.parse(window.getStartTime());
        java.time.LocalTime windowEnd = java.time.LocalTime.parse(window.getEndTime());

        java.time.LocalTime bookingStart = start.toLocalTime();
        java.time.LocalTime bookingEnd = end.toLocalTime();

        return !bookingStart.isBefore(windowStart) && !bookingEnd.isAfter(windowEnd);
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
            throw new InvalidBookingException("Time slot already booked");
        }
    }
}