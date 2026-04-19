package com.smartcampus.auth.entity;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.LocalDateTime;
import java.util.Set;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "users")
public class User {
    
    @Id
    private String id;
    private String username;
    private String password;
    private String email;
    private Set<String> roles;
    private boolean enabled;
    private boolean oauth2;
    private String resetToken;
    
    private String otp;
    private LocalDateTime otpExpiryTime;
    private Integer otpAttempts;
}