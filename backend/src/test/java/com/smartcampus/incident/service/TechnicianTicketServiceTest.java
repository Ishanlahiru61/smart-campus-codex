package com.smartcampus.incident.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.incident.dto.AddCommentDTO;
import com.smartcampus.incident.entity.IncidentTicket;
import com.smartcampus.incident.repository.IncidentTicketRepository;
import com.smartcampus.notification.service.NotificationService;
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
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class TechnicianTicketServiceTest {

    @Mock
    private IncidentTicketRepository repository;

    @Mock
    private UserRepository userRepository;

    @Mock
    private NotificationService notificationService;

    @Mock
    private SecurityContext securityContext;

    @Mock
    private Authentication authentication;

    @InjectMocks
    private TechnicianTicketService service;

    @BeforeEach
    void setUp() {
        SecurityContextHolder.setContext(securityContext);
    }

    @Test
    void getAssignedTickets_Success() {
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("tech@test.com");
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.of(User.builder().id("u1").build()));
        when(repository.findAll()).thenReturn(Collections.emptyList());

        var result = service.getAssignedTickets();
        assertNotNull(result);
    }

    @Test
    void updateTicketStatus_Success() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").assignedTechnician("tech@test.com").build();
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("tech@test.com");
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.empty());
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));
        when(repository.save(any(IncidentTicket.class))).thenAnswer(i -> i.getArguments()[0]);

        IncidentTicket result = service.updateTicketStatus("t1", IncidentTicket.TicketStatus.IN_PROGRESS, "Working on it");

        assertEquals(IncidentTicket.TicketStatus.IN_PROGRESS, result.getStatus());
    }

    @Test
    void updateTicketStatus_InvalidTransition_ThrowsException() {
        IncidentTicket ticket = IncidentTicket.builder().id("t1").assignedTechnician("tech@test.com").build();
        when(securityContext.getAuthentication()).thenReturn(authentication);
        when(authentication.getName()).thenReturn("tech@test.com");
        when(userRepository.findByEmail("tech@test.com")).thenReturn(Optional.empty());
        when(repository.findById("t1")).thenReturn(Optional.of(ticket));

        assertThrows(IllegalArgumentException.class, () -> service.updateTicketStatus("t1", IncidentTicket.TicketStatus.OPEN, null));
    }
}
