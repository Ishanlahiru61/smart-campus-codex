package com.smartcampus.booking.repository;

import com.smartcampus.booking.entity.Booking;
import org.springframework.data.mongodb.repository.MongoRepository;

import java.time.LocalDateTime;
import java.util.List;

public interface BookingRepository extends MongoRepository<Booking, String> {

    List<Booking> findByUserId(String userId);

    List<Booking> findByResourceIdAndStartTimeLessThanEqualAndEndTimeGreaterThanEqual(
        String resourceId,
        LocalDateTime endTime,
        LocalDateTime startTime
    );
}