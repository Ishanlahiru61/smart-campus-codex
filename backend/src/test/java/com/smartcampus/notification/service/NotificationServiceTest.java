package com.smartcampus.notification.service;

import com.smartcampus.notification.entity.Notification;
import com.smartcampus.notification.entity.NotificationType;
import com.smartcampus.notification.repository.NotificationRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.messaging.simp.SimpMessagingTemplate;

import java.util.Collections;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.eq;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class NotificationServiceTest {

    @Mock
    private NotificationRepository notificationRepository;

    @Mock
    private SimpMessagingTemplate messagingTemplate;

    @InjectMocks
    private NotificationService notificationService;

    @Test
    void createAndSendNotification_Success() {
        Notification notification = Notification.builder()
                .id("n1")
                .userEmail("test@test.com")
                .role("USER")
                .message("Hello")
                .build();
        
        when(notificationRepository.save(any(Notification.class))).thenReturn(notification);

        notificationService.createAndSendNotification("test@test.com", "USER", "Hello", NotificationType.SYSTEM);

        verify(notificationRepository).save(any(Notification.class));
        verify(messagingTemplate).convertAndSendToUser(eq("test@test.com"), anyString(), eq(notification));
    }

    @Test
    void getUserNotifications_Success() {
        when(notificationRepository.findByUserEmailAndRoleOrderByCreatedAtDesc("test@test.com", "USER"))
                .thenReturn(Collections.singletonList(new Notification()));
        
        List<Notification> result = notificationService.getUserNotifications("test@test.com", "USER");
        
        assertEquals(1, result.size());
    }

    @Test
    void markAsRead_Success() {
        Notification notification = Notification.builder().id("n1").isRead(false).build();
        when(notificationRepository.findById("n1")).thenReturn(Optional.of(notification));
        when(notificationRepository.save(any(Notification.class))).thenAnswer(i -> i.getArguments()[0]);

        Optional<Notification> result = notificationService.markAsRead("n1");

        assertTrue(result.isPresent());
        assertTrue(result.get().isRead());
    }
}
