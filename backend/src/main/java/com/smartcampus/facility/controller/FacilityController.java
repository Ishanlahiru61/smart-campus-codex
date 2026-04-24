package com.smartcampus.facility.controller;

import com.smartcampus.facility.dto.FacilityRequestDTO;
import com.smartcampus.facility.entity.Facility;
import com.smartcampus.facility.service.FacilityService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.service.CloudinaryService;
import org.springframework.web.multipart.MultipartFile;
import jakarta.validation.Validator;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/facilities")
@RequiredArgsConstructor
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class FacilityController {

    private final FacilityService facilityService;
    private final CloudinaryService cloudinaryService;
    private final ObjectMapper objectMapper;
    private final Validator validator;

    /**
     * GET /facilities - Retrieve all facilities
     * HTTP Method: GET
     * Status: 200 OK
     */
    @GetMapping
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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
    @PostMapping(consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> createFacility(
            @RequestPart("facility") String facilityJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            FacilityRequestDTO request = objectMapper.readValue(facilityJson, FacilityRequestDTO.class);
            
            // Validate the parsed request
            var violations = validator.validate(request);
            if (!violations.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                violations.forEach(v -> sb.append(v.getMessage()).append("; "));
                throw new IllegalArgumentException(sb.toString());
            }

            if (image != null && !image.isEmpty()) {
                String imageUrl = cloudinaryService.uploadFile(image);
                request.setImageUrl(imageUrl);
            }

            String currentUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
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
    @PutMapping(value = "/{id}", consumes = {"multipart/form-data"})
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFacility(
            @PathVariable String id,
            @RequestPart("facility") String facilityJson,
            @RequestPart(value = "image", required = false) MultipartFile image) {
        try {
            FacilityRequestDTO request = objectMapper.readValue(facilityJson, FacilityRequestDTO.class);
            
            // Validate the parsed request
            var violations = validator.validate(request);
            if (!violations.isEmpty()) {
                StringBuilder sb = new StringBuilder();
                violations.forEach(v -> sb.append(v.getMessage()).append("; "));
                throw new IllegalArgumentException(sb.toString());
            }

            if (image != null && !image.isEmpty()) {
                String imageUrl = cloudinaryService.uploadFile(image);
                request.setImageUrl(imageUrl);
            }

            String currentUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
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
    @PreAuthorize("hasRole('ADMIN')")
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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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
    @PreAuthorize("hasRole('ADMIN')")
    public ResponseEntity<?> updateFacilityStatus(
            @PathVariable String id,
            @RequestParam Facility.FacilityStatus status) {
        try {
            String currentUser = org.springframework.security.core.context.SecurityContextHolder.getContext().getAuthentication().getName();
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
    @PreAuthorize("hasAnyRole('USER', 'ADMIN')")
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
