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
import org.springframework.security.core.context.SecurityContext;
import org.springframework.security.core.context.SecurityContextHolder;

import java.util.Collections;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class IncidentTicketServiceTest {

    @Mock
    private IncidentTicketRepository repository;

    @Mock
    private CloudinaryService cloudinaryService;

    @Mock
    private NotificationService notificationService;

    @Mock
    private UserRepository userRepository;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private IncidentTicketServiceImpl service;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

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
    void assignTechnician_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").build();
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any(IncidentTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        Optional<IncidentTicket> result = service.assignTechnician("t1", "tech1", "John Doe");

        assertTrue(result.isPresent());
        assertEquals("tech1", result.get().getAssignedTechnician());
    }
}
