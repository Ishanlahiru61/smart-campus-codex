package com.smartcampus.notification.repository;

import com.smartcampus.notification.entity.Notification;
import org.springframework.data.mongodb.repository.MongoRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface NotificationRepository extends MongoRepository<Notification, String> {
    
    List<Notification> findByUserEmailAndRoleOrderByCreatedAtDesc(String userEmail, String role);
    
    long countByUserEmailAndRoleAndIsReadFalse(String userEmail, String role);
}
