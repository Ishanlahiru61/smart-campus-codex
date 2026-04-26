package com.smartcampus.facility.repository;

import com.smartcampus.facility.entity.Facility;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface FacilityRepository extends MongoRepository<Facility, String> {

    List<Facility> findByType(String type);

    List<Facility> findByStatus(Facility.FacilityStatus status);

    List<Facility> findByLocation(String location);

    List<Facility> findByCapacityGreaterThanEqual(Integer capacity);

    List<Facility> findByCapacityLessThanEqual(Integer capacity);

    List<Facility> findByBuildingCode(String buildingCode);

    @Query("{ 'name': { $regex: ?0, $options: 'i' } }")
    List<Facility> searchByName(String name);

    @Query("{ '$and': [" +
            "{ 'type': ?0 }, " +
            "{ 'status': 'ACTIVE' }, " +
            "{ 'capacity': { $gte: ?1 } }" +
            "] }")
    List<Facility> findAvailableFacilitiesByTypeAndCapacity(String type, Integer capacity);

    @Query("{ '$and': [" +
            "{ 'location': ?0 }, " +
            "{ 'status': 'ACTIVE' }" +
            "] }")
    List<Facility> findActiveByLocation(String location);

    Long countByType(String type);

    Long countByStatus(Facility.FacilityStatus status);
}
