package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/admin")
@RequiredArgsConstructor
public class AdminController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        
        // 1. Check if email already exists (using plain text email)
        if (userRepository.findByEmail(request.email()).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        // 2. Enforce max 4 admins rule
        if ("ADMIN".equalsIgnoreCase(request.role())) {
            // Note: Assuming your repository method is countByRole since your User entity uses 'String role'
            long adminCount = userRepository.countByRole("ADMIN"); 
            if (adminCount >= 4) {
                return ResponseEntity.badRequest().body("Maximum of 4 admins allowed.");
            }
        }

        // 3. Build and save the user
        User newUser = User.builder()
                .email(request.email()) 
                .password(passwordEncoder.encode(request.password()))
                .role(request.role().toUpperCase())
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("User created successfully.");
    }
}