package com.smartcampus.facility.service;

import com.smartcampus.facility.dto.FacilityRequestDTO;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.booking.repository.BookingRepository;
import com.smartcampus.booking.entity.BookingStatus;
import com.smartcampus.booking.entity.Booking;
import com.smartcampus.facility.repository.FacilityRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FacilityService {

    private final FacilityRepository facilityRepository;
    private final BookingRepository bookingRepository;

    /**
     * GET: Retrieve all facilities
     */
    public List<Facility> getAllFacilities() {
        return facilityRepository.findAll();
    }

    /**
     * GET: Retrieve facility by ID
     */
    public Optional<Facility> getFacilityById(String id) {
        return facilityRepository.findById(id);
    }

    /**
     * POST: Create a new facility
     */
    public Facility createFacility(FacilityRequestDTO request, String createdBy) {
        Facility facility = Facility.builder()
                .name(request.getName())
                .type(request.getType())
                .capacity(request.getCapacity())
                .location(request.getLocation())
                .description(request.getDescription())
                .status(request.getStatus() != null ? request.getStatus() : Facility.FacilityStatus.ACTIVE)
                .amenities(request.getAmenities())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .floorNumber(request.getFloorNumber())
                .buildingCode(request.getBuildingCode())
                .contactPerson(request.getContactPerson())
                .contactEmail(request.getContactEmail())
                .contactPhone(request.getContactPhone())
                .availabilityWindows(request.getAvailabilityWindows())
                .costPerHour(request.getCostPerHour())
                .requiresApproval(request.getRequiresApproval() != null ? request.getRequiresApproval() : false)
                .imageUrl(request.getImageUrl())
                .createdAt(LocalDateTime.now())
                .updatedAt(LocalDateTime.now())
                .createdBy(createdBy)
                .updatedBy(createdBy)
                .totalBookings(0)
                .averageRating(0.0)
                .build();

        return facilityRepository.save(facility);
    }

    /**
     * PUT: Update an existing facility
     */
    public Optional<Facility> updateFacility(String id, FacilityRequestDTO request, String updatedBy) {
        return facilityRepository.findById(id)
                .map(existing -> {
                    if (request.getName() != null) existing.setName(request.getName());
                    if (request.getType() != null) existing.setType(request.getType());
                    if (request.getCapacity() != null) existing.setCapacity(request.getCapacity());
                    if (request.getLocation() != null) existing.setLocation(request.getLocation());
                    if (request.getDescription() != null) existing.setDescription(request.getDescription());
                    if (request.getStatus() != null) existing.setStatus(request.getStatus());
                    if (request.getAmenities() != null) existing.setAmenities(request.getAmenities());
                    if (request.getLatitude() != null) existing.setLatitude(request.getLatitude());
                    if (request.getLongitude() != null) existing.setLongitude(request.getLongitude());
                    if (request.getFloorNumber() != null) existing.setFloorNumber(request.getFloorNumber());
                    if (request.getBuildingCode() != null) existing.setBuildingCode(request.getBuildingCode());
                    if (request.getContactPerson() != null) existing.setContactPerson(request.getContactPerson());
                    if (request.getContactEmail() != null) existing.setContactEmail(request.getContactEmail());
                    if (request.getContactPhone() != null) existing.setContactPhone(request.getContactPhone());
                    if (request.getAvailabilityWindows() != null) existing.setAvailabilityWindows(request.getAvailabilityWindows());
                    if (request.getCostPerHour() != null) existing.setCostPerHour(request.getCostPerHour());
                    if (request.getRequiresApproval() != null) existing.setRequiresApproval(request.getRequiresApproval());
                    if (request.getImageUrl() != null) existing.setImageUrl(request.getImageUrl());

                    existing.setUpdatedAt(LocalDateTime.now());
                    existing.setUpdatedBy(updatedBy);

                    return facilityRepository.save(existing);
                });
    }

    /**
     * DELETE: Remove a facility
     */
    public boolean deleteFacility(String id) {
        if (facilityRepository.existsById(id)) {
            List<Booking> activeBookings = bookingRepository.findByResourceId(id).stream()
                    .filter(b -> b.getStatus() == BookingStatus.PENDING || b.getStatus() == BookingStatus.APPROVED)
                    .collect(Collectors.toList());
            if (!activeBookings.isEmpty()) {
                throw new IllegalStateException("Cannot delete facility with active bookings.");
            }
            facilityRepository.deleteById(id);
            return true;
        }
        return false;
    }

    /**
     * GET: Search facilities by name
     */
    public List<Facility> searchFacilitiesByName(String name) {
        return facilityRepository.searchByName(name);
    }

    /**
     * GET: Filter facilities by type
     */
    public List<Facility> getFacilitiesByType(String type) {
        return facilityRepository.findByType(type);
    }

    /**
     * GET: Filter facilities by location
     */
    public List<Facility> getFacilitiesByLocation(String location) {
        return facilityRepository.findByLocation(location);
    }

    /**
     * GET: Filter active facilities by location
     */
    public List<Facility> getActiveFacilitiesByLocation(String location) {
        return facilityRepository.findActiveByLocation(location);
    }

    /**
     * GET: Filter facilities by capacity
     */
    public List<Facility> getFacilitiesByCapacity(Integer minCapacity, Integer maxCapacity) {
        List<Facility> facilities = facilityRepository.findByCapacityGreaterThanEqual(minCapacity);
        if (maxCapacity != null) {
            facilities = facilities.stream()
                    .filter(f -> f.getCapacity() <= maxCapacity)
                    .collect(Collectors.toList());
        }
        return facilities;
    }

    /**
     * GET: Find available facilities by type and capacity
     */
    public List<Facility> findAvailableFacilities(String type, Integer capacity) {
        return facilityRepository.findAvailableFacilitiesByTypeAndCapacity(type, capacity);
    }

    /**
     * GET: Filter facilities by status
     */
    public List<Facility> getFacilitiesByStatus(Facility.FacilityStatus status) {
        return facilityRepository.findByStatus(status);
    }

    /**
     * PATCH: Update facility status
     */
    public Optional<Facility> updateFacilityStatus(String id, Facility.FacilityStatus status, String updatedBy) {
        return facilityRepository.findById(id)
                .map(facility -> {
                    facility.setStatus(status);
                    facility.setUpdatedAt(LocalDateTime.now());
                    facility.setUpdatedBy(updatedBy);
                    return facilityRepository.save(facility);
                });
    }

    /**
     * GET: Get statistics
     */
    public FacilityStatistics getStatistics() {
        return FacilityStatistics.builder()
                .totalFacilities((int) facilityRepository.count())
                .activeFacilities(facilityRepository.countByStatus(Facility.FacilityStatus.ACTIVE).intValue())
                .outOfServiceFacilities(facilityRepository.countByStatus(Facility.FacilityStatus.OUT_OF_SERVICE).intValue())
                .maintenanceFacilities(facilityRepository.countByStatus(Facility.FacilityStatus.MAINTENANCE).intValue())
                .build();
    }

    @lombok.Data
    @lombok.Builder
    public static class FacilityStatistics {
        private int totalFacilities;
        private int activeFacilities;
        private int outOfServiceFacilities;
        private int maintenanceFacilities;
    }
}
