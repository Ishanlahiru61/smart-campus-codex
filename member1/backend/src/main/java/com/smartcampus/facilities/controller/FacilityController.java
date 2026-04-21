package com.smartcampus.facilities.controller;

import com.smartcampus.facilities.dto.FacilityRequestDTO;
import com.smartcampus.facilities.model.Facility;
import com.smartcampus.facilities.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FacilityController {

    private final FacilityService facilityService;

    /**
     * GET /facilities - Retrieve all facilities
     * HTTP Method: GET
     * Status: 200 OK
     */
    @GetMapping
    public ResponseEntity<?> getAllFacilities(
            @RequestParam(required = false) String type,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) String status) {
        try {
            List<Facility> facilities;

            if (type != null) {
                facilities = facilityService.getFacilitiesByType(type);
            } else if (location != null) {
                facilities = facilityService.getFacilitiesByLocation(location);
            } else if (status != null) {
                facilities = facilityService.getFacilitiesByStatus(Facility.FacilityStatus.valueOf(status));
            } else {
                facilities = facilityService.getAllFacilities();
            }

            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Facilities retrieved successfully",
                    "data", facilities,
                    "count", facilities.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving facilities: " + e.getMessage()
                    ));
        }
    }

    /**
     * GET /facilities/{id} - Retrieve facility by ID
     * HTTP Method: GET
     * Status: 200 OK or 404 NOT FOUND
     */
    @GetMapping("/{id}")
    public ResponseEntity<?> getFacilityById(@PathVariable String id) {
        try {
            return facilityService.getFacilityById(id)
                    .map(facility -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Facility retrieved successfully",
                            "data", facility
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Facility not found with ID: " + id
                            )));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving facility: " + e.getMessage()
                    ));
        }
    }

    /**
     * POST /facilities - Create a new facility
     * HTTP Method: POST
     * Status: 201 CREATED
     */
    @PostMapping
    public ResponseEntity<?> createFacility(@Valid @RequestBody FacilityRequestDTO request) {
        try {
            String currentUser = "SYSTEM_USER"; // In real app, get from SecurityContext
            Facility createdFacility = facilityService.createFacility(request, currentUser);

            return ResponseEntity.status(HttpStatus.CREATED)
                    .body(Map.of(
                            "success", true,
                            "message", "Facility created successfully",
                            "data", createdFacility
                    ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "Error creating facility: " + e.getMessage()
                    ));
        }
    }

    /**
     * PUT /facilities/{id} - Update a facility
     * HTTP Method: PUT
     * Status: 200 OK or 404 NOT FOUND
     */
    @PutMapping("/{id}")
    public ResponseEntity<?> updateFacility(
            @PathVariable String id,
            @Valid @RequestBody FacilityRequestDTO request) {
        try {
            String currentUser = "SYSTEM_USER"; // In real app, get from SecurityContext
            return facilityService.updateFacility(id, request, currentUser)
                    .map(updatedFacility -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Facility updated successfully",
                            "data", updatedFacility
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Facility not found with ID: " + id
                            )));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "Error updating facility: " + e.getMessage()
                    ));
        }
    }

    /**
     * DELETE /facilities/{id} - Delete a facility
     * HTTP Method: DELETE
     * Status: 204 NO CONTENT or 404 NOT FOUND
     */
    @DeleteMapping("/{id}")
    public ResponseEntity<?> deleteFacility(@PathVariable String id) {
        try {
            if (facilityService.deleteFacility(id)) {
                return ResponseEntity.noContent().build();
            } else {
                return ResponseEntity.status(HttpStatus.NOT_FOUND)
                        .body(Map.of(
                                "success", false,
                                "message", "Facility not found with ID: " + id
                        ));
            }
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error deleting facility: " + e.getMessage()
                    ));
        }
    }

    /**
     * GET /facilities/search/by-name - Search facilities by name
     * HTTP Method: GET
     * Status: 200 OK
     */
    @GetMapping("/search/by-name")
    public ResponseEntity<?> searchByName(@RequestParam String name) {
        try {
            List<Facility> facilities = facilityService.searchFacilitiesByName(name);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Search results retrieved successfully",
                    "data", facilities,
                    "count", facilities.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error searching facilities: " + e.getMessage()
                    ));
        }
    }

    /**
     * GET /facilities/available - Find available facilities by type and capacity
     * HTTP Method: GET
     * Status: 200 OK
     */
    @GetMapping("/available")
    public ResponseEntity<?> getAvailableFacilities(
            @RequestParam String type,
            @RequestParam Integer capacity) {
        try {
            List<Facility> facilities = facilityService.findAvailableFacilities(type, capacity);
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Available facilities retrieved successfully",
                    "data", facilities,
                    "count", facilities.size()
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving available facilities: " + e.getMessage()
                    ));
        }
    }

    /**
     * PATCH /facilities/{id}/status - Update facility status
     * HTTP Method: PATCH
     * Status: 200 OK or 404 NOT FOUND
     */
    @PatchMapping("/{id}/status")
    public ResponseEntity<?> updateFacilityStatus(
            @PathVariable String id,
            @RequestParam Facility.FacilityStatus status) {
        try {
            String currentUser = "SYSTEM_USER"; // In real app, get from SecurityContext
            return facilityService.updateFacilityStatus(id, status, currentUser)
                    .map(updatedFacility -> ResponseEntity.ok(Map.of(
                            "success", true,
                            "message", "Facility status updated successfully",
                            "data", updatedFacility
                    )))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND)
                            .body(Map.of(
                                    "success", false,
                                    "message", "Facility not found with ID: " + id
                            )));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                    .body(Map.of(
                            "success", false,
                            "message", "Error updating facility status: " + e.getMessage()
                    ));
        }
    }

    /**
     * GET /facilities/statistics - Get facility statistics
     * HTTP Method: GET
     * Status: 200 OK
     */
    @GetMapping("/statistics")
    public ResponseEntity<?> getStatistics() {
        try {
            FacilityService.FacilityStatistics stats = facilityService.getStatistics();
            return ResponseEntity.ok(Map.of(
                    "success", true,
                    "message", "Statistics retrieved successfully",
                    "data", stats
            ));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR)
                    .body(Map.of(
                            "success", false,
                            "message", "Error retrieving statistics: " + e.getMessage()
                    ));
        }
    }

    @ExceptionHandler(IllegalArgumentException.class)
    public ResponseEntity<?> handleIllegalArgument(IllegalArgumentException e) {
        return ResponseEntity.status(HttpStatus.BAD_REQUEST)
                .body(Map.of(
                        "success", false,
                        "message", "Invalid input: " + e.getMessage()
                ));
    }
}
