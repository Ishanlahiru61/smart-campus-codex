package com.smartcampus.incident.service;

import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.dto.CreateIncidentTicketDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import com.smartcampus.notification.service.NotificationService;
import com.smartcampus.service.CloudinaryService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.*;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentTicketServiceTest {

    @Mock private IncidentTicketRepository repository;
    @Mock private CloudinaryService cloudinaryService;
    @Mock private NotificationService notificationService;
    @Mock private UserRepository userRepository;
    @Mock private SecurityContext securityContext;
    @Mock private Authentication authentication;

    @InjectMocks
    private IncidentTicketServiceImpl service;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    // =================== createIncidentTicket ===================

    @Test
    void createTicket_Success() {
        CreateIncidentTicketDTO dto = new CreateIncidentTicketDTO();
        dto.setTitle("Leaking Pipe");
        dto.setCategory("PLUMBING");
        dto.setPriority(IncidentTicket.TicketPriority.HIGH);
        dto.setFacilityId("fac1");

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(userRepository.findByRolesContaining("ROLE_ADMIN")).thenReturn(Collections.emptyList());
        when(repository.save(any(IncidentTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        IncidentTicket result = service.createIncidentTicket(dto, null);

        assertNotNull(result);
        assertEquals("Leaking Pipe", result.getTitle());
        assertEquals(IncidentTicket.TicketStatus.OPEN, result.getStatus());
    }

    @Test
    void createTicket_WithAdminNotification() {
        CreateIncidentTicketDTO dto = new CreateIncidentTicketDTO();
        dto.setTitle("Broken AC");
        dto.setCategory("HVAC");
        dto.setPriority(IncidentTicket.TicketPriority.MEDIUM);
        dto.setFacilityId("fac2");

        com.smartcampus.auth.entity.User admin = com.smartcampus.auth.entity.User.builder()
                .email("admin@test.com").build();

        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(userRepository.findByRolesContaining("ROLE_ADMIN")).thenReturn(List.of(admin));
        when(repository.save(any(IncidentTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        IncidentTicket result = service.createIncidentTicket(dto, null);

        assertNotNull(result);
        verify(notificationService).createAndSendNotification(eq("admin@test.com"), anyString(), anyString(), any());
    }

    // =================== getTicketById ===================

    @Test
    void getTicketById_AsOwner_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").reportedBy("user@test.com").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());

        Optional<IncidentTicket> result = service.getTicketById("t1");

        assertTrue(result.isPresent());
        assertEquals("t1", result.get().getId());
    }

    @Test
    void getTicketById_AsAdmin_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").reportedBy("other@test.com").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .when(authentication).getAuthorities();

        Optional<IncidentTicket> result = service.getTicketById("t1");

        assertTrue(result.isPresent());
    }

    @Test
    void getTicketById_Unauthorized_ThrowsException() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").reportedBy("other@test.com").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());

        assertThrows(org.springframework.security.access.AccessDeniedException.class,
                () -> service.getTicketById("t1"));
    }

    @Test
    void getTicketById_NotFound_ReturnsEmpty() {
        when(repository.findById("missing")).thenReturn(Optional.empty());
        Optional<IncidentTicket> result = service.getTicketById("missing");
        assertTrue(result.isEmpty());
    }

    // =================== updateTicketStatus ===================

    @Test
    void updateTicketStatus_Resolved_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").assignedTechnician("tech1").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Optional<IncidentTicket> result = service.updateTicketStatus("t1",
                IncidentTicket.TicketStatus.RESOLVED, "Fixed the issue", null);

        assertTrue(result.isPresent());
        assertEquals(IncidentTicket.TicketStatus.RESOLVED, result.get().getStatus());
        assertEquals("Fixed the issue", result.get().getResolutionNotes());
        verify(notificationService).createAndSendNotification(eq("tech1"), anyString(), anyString(), any());
    }

    @Test
    void updateTicketStatus_Closed_SetsClosedAt() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Optional<IncidentTicket> result = service.updateTicketStatus("t1",
                IncidentTicket.TicketStatus.CLOSED, null, null);

        assertTrue(result.isPresent());
        assertEquals(IncidentTicket.TicketStatus.CLOSED, result.get().getStatus());
        assertNotNull(result.get().getClosedAt());
    }

    // =================== assignTechnician / unassign ===================

    @Test
    void assignTechnician_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Optional<IncidentTicket> result = service.assignTechnician("t1", "tech1", "John Doe");

        assertTrue(result.isPresent());
        assertEquals("tech1", result.get().getAssignedTechnician());
        verify(notificationService).createAndSendNotification(eq("tech1"), anyString(), anyString(), any());
    }

    @Test
    void assignTechnician_NotFound_ReturnsEmpty() {
        when(repository.findById("missing")).thenReturn(Optional.empty());
        Optional<IncidentTicket> result = service.assignTechnician("missing", "tech1", "Name");
        assertTrue(result.isEmpty());
    }

    @Test
    void unassignTechnician_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").assignedTechnician("tech1").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        Optional<IncidentTicket> result = service.unassignTechnician("t1");

        assertTrue(result.isPresent());
        assertNull(result.get().getAssignedTechnician());
    }

    // =================== addComment ===================

    @Test
    void addComment_AsOwner_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1")
                .reportedBy("user@test.com").comments(new ArrayList<>()).build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        AddCommentDTO dto = new AddCommentDTO();
        dto.setContent("Pipe is still leaking");
        dto.setCommentedBy("user@test.com");

        Optional<IncidentTicket> result = service.addComment("t1", dto);

        assertTrue(result.isPresent());
        assertEquals(1, result.get().getComments().size());
        assertEquals("Pipe is still leaking", result.get().getComments().get(0).getContent());
    }

    // =================== deleteTicket ===================

    @Test
    void deleteTicket_Found_Success() {
        when(repository.existsById("t1")).thenReturn(true);
        boolean deleted = service.deleteTicket("t1");
        assertTrue(deleted);
        verify(repository).deleteById("t1");
    }

    @Test
    void deleteTicket_NotFound_ReturnsFalse() {
        when(repository.existsById("missing")).thenReturn(false);
        boolean deleted = service.deleteTicket("missing");
        assertFalse(deleted);
        verify(repository, never()).deleteById(any());
    }

    // =================== query methods ===================

    @Test
    void getAllTickets_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        doReturn(List.of(new SimpleGrantedAuthority("ROLE_ADMIN")))
                .when(authentication).getAuthorities();
        when(repository.findAll()).thenReturn(Collections.emptyList());
        assertNotNull(service.getAllTickets());
    }

    @Test
    void getTicketsByStatus_Success() {
        when(repository.findByStatus(IncidentTicket.TicketStatus.OPEN)).thenReturn(Collections.emptyList());
        assertNotNull(service.getTicketsByStatus(IncidentTicket.TicketStatus.OPEN));
    }

    @Test
    void getTicketsByFacility_Success() {
        when(repository.findByFacilityId("f1")).thenReturn(Collections.emptyList());
        assertNotNull(service.getTicketsByFacility("f1"));
    }

    @Test
    void getTicketsByPriority_Success() {
        when(repository.findByPriority(IncidentTicket.TicketPriority.HIGH)).thenReturn(Collections.emptyList());
        assertNotNull(service.getTicketsByPriority(IncidentTicket.TicketPriority.HIGH));
    }

    @Test
    void getOpenTickets_Success() {
        when(repository.findOpenTickets()).thenReturn(Collections.emptyList());
        assertNotNull(service.getOpenTickets());
    }

    @Test
    void getUnassignedTickets_Success() {
        when(repository.findUnassignedTickets()).thenReturn(Collections.emptyList());
        assertNotNull(service.getUnassignedTickets());
    }

    @Test
    void getTechnicianTickets_Success() {
        when(repository.findByAssignedTechnician("tech1")).thenReturn(Collections.emptyList());
        assertNotNull(service.getTechnicianTickets("tech1"));
    }

    @Test
    void searchTickets_Success() {
        when(repository.searchByTitle("leak")).thenReturn(Collections.emptyList());
        assertNotNull(service.searchTickets("leak"));
    }

    @Test
    void getStatistics_Success() {
        when(repository.count()).thenReturn(20L);
        when(repository.countByStatus(IncidentTicket.TicketStatus.OPEN)).thenReturn(10L);
        when(repository.countByStatus(IncidentTicket.TicketStatus.IN_PROGRESS)).thenReturn(5L);
        when(repository.countByStatus(IncidentTicket.TicketStatus.RESOLVED)).thenReturn(5L);

        Map<String, Object> stats = service.getStatistics();

        assertNotNull(stats);
        assertEquals(20L, stats.get("total"));
        assertEquals(10L, stats.get("open"));
    }

    // =================== updateTicket ===================

    @Test
    void updateTicket_AsOwner_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1")
                .reportedBy("user@test.com").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("user@test.com");
        when(authentication.getAuthorities()).thenReturn(Collections.emptyList());
        when(repository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        CreateIncidentTicketDTO dto = new CreateIncidentTicketDTO();
        dto.setTitle("Updated Title");
        dto.setDescription("Updated Desc");
        dto.setPriority(IncidentTicket.TicketPriority.LOW);
        dto.setCategory("Electrical");

        Optional<IncidentTicket> result = service.updateTicket("t1", dto);

        assertTrue(result.isPresent());
        assertEquals("Updated Title", result.get().getTitle());
    }
}
