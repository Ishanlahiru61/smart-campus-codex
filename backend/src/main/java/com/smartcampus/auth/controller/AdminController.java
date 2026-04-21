package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.Set;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EncryptionUtil encryptionUtil;

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        
        String encryptedEmail = encryptionUtil.encrypt(request.email());

        // 1. Check if email already exists (using encrypted email)
        if (userRepository.findByEmail(encryptedEmail).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        // 2. Enforce max 4 admins rule
        if ("ADMIN".equalsIgnoreCase(request.role())) {
            long adminCount = userRepository.countByRolesContaining("ADMIN"); 
            if (adminCount >= 4) {
                return ResponseEntity.badRequest().body("Maximum of 4 admins allowed.");
            }
        }

        // 3. Build and save the user
        User newUser = User.builder()
                .username(request.username())
                .email(encryptedEmail) 
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(request.role().toUpperCase()))
                .enabled(true)
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("User created successfully.");
    }
}