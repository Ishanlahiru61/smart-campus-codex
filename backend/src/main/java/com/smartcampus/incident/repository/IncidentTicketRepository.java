package com.smartcampus.incidents.repository;

import com.smartcampus.incidents.model.IncidentTicket;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.data.mongodb.repository.Query;
import org.springframework.stereotype.Repository;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Repository
public interface IncidentTicketRepository extends MongoRepository<IncidentTicket, String> {

    // Find by status
    List<IncidentTicket> findByStatus(IncidentTicket.TicketStatus status);

    // Find by facility
    List<IncidentTicket> findByFacilityId(String facilityId);

    // Find by priority
    List<IncidentTicket> findByPriority(IncidentTicket.TicketPriority priority);

    // Find by assigned technician
    List<IncidentTicket> findByAssignedTechnician(String technicianId);

    // Find by category
    List<IncidentTicket> findByCategory(String category);

    // Search by title
    @Query("{ 'title': { $regex: ?0, $options: 'i' } }")
    List<IncidentTicket> searchByTitle(String title);

    // Find open tickets
    @Query("{ 'status': { $in: ['OPEN', 'IN_PROGRESS'] } }")
    List<IncidentTicket> findOpenTickets();

    // Find tickets by status and facility
    @Query("{ 'status': ?0, 'facilityId': ?1 }")
    List<IncidentTicket> findByStatusAndFacility(IncidentTicket.TicketStatus status, String facilityId);

    // Find tickets within date range
    @Query("{ 'createdAt': { $gte: ?0, $lte: ?1 } }")
    List<IncidentTicket> findByDateRange(LocalDateTime startDate, LocalDateTime endDate);

    // Count by status
    Long countByStatus(IncidentTicket.TicketStatus status);

    // Count by priority
    Long countByPriority(IncidentTicket.TicketPriority priority);

    // Find by ticket number
    Optional<IncidentTicket> findByTicketNumber(String ticketNumber);

    // Find unassigned tickets
    @Query("{ 'assignedTechnician': null }")
    List<IncidentTicket> findUnassignedTickets();

    // Find high priority open tickets
    @Query("{ 'priority': 'HIGH', 'status': 'OPEN' }")
    List<IncidentTicket> findHighPriorityOpenTickets();
}
