package com.smartcampus.notification.service;

import com.smartcampus.notification.entity.Notification;
import com.smartcampus.notification.entity.NotificationType;
import com.smartcampus.notification.repository.NotificationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Optional;

@Service
@RequiredArgsConstructor
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    public void createAndSendNotification(String userEmail, String role, String message, NotificationType type) {
        Notification notification = Notification.builder()
                .userEmail(userEmail)
                .role(role)
                .message(message)
                .type(type)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();

        Notification savedNotification = notificationRepository.save(notification);

        // Send to WebSocket topic for specific user and role
        String destination = "/queue/notifications/" + userEmail + "/" + role;
        messagingTemplate.convertAndSendToUser(
                userEmail, 
                destination, 
                savedNotification
        );
    }

    public List<Notification> getUserNotifications(String userEmail, String role) {
        return notificationRepository.findByUserEmailAndRoleOrderByCreatedAtDesc(userEmail, role);
    }

    public long getUnreadCount(String userEmail, String role) {
        return notificationRepository.countByUserEmailAndRoleAndIsReadFalse(userEmail, role);
    }

    public Optional<Notification> markAsRead(String id) {
        return notificationRepository.findById(id).map(notification -> {
            notification.setRead(true);
            return notificationRepository.save(notification);
        });
    }

    public void deleteNotification(String id) {
        notificationRepository.deleteById(id);
    }
}
