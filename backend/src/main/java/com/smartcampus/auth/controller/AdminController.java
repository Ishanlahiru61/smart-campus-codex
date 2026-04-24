package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.CreateUserRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.service.UserService;
import com.smartcampus.auth.util.EncryptionUtil;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;
import java.util.Set;

@RestController
@RequestMapping("/api/admin")
@RequiredArgsConstructor
@PreAuthorize("hasRole('ADMIN')")
@CrossOrigin(origins = {"http://localhost:5173", "http://localhost:3000"})
public class AdminController {

    // Auth module dependencies
    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final EncryptionUtil encryptionUtil;
    private final UserService userService;

    // ==================== AUTHENTICATION & USER CREATION ====================

    @PostMapping("/create-user")
    public ResponseEntity<?> createUser(@RequestBody CreateUserRequest request) {
        
        String email = request.email().trim();

        // 1. Check if email already exists
        if (userRepository.findByEmail(email).isPresent()) {
            return ResponseEntity.badRequest().body("Email already exists.");
        }

        // 2. Enforce max 4 admins rule
        if ("ADMIN".equalsIgnoreCase(request.role()) || "ROLE_ADMIN".equalsIgnoreCase(request.role())) {
            long adminCount = userRepository.countByRolesContaining("ROLE_ADMIN") + userRepository.countByRolesContaining("ADMIN"); 
            if (adminCount >= 4) {
                return ResponseEntity.badRequest().body("Maximum of 4 admins allowed.");
            }
        }

        // 3. Build and save the user
        String roleWithPrefix = request.role().toUpperCase().startsWith("ROLE_") 
                ? request.role().toUpperCase() 
                : "ROLE_" + request.role().toUpperCase();

        User newUser = User.builder()
                .username(request.username())
                .email(email) 
                .password(passwordEncoder.encode(request.password()))
                .roles(Set.of(roleWithPrefix))
                .enabled(true)
                .build();

        userRepository.save(newUser);
        return ResponseEntity.ok("User created successfully.");
    }


    // ==================== USER MANAGEMENT ====================

    @GetMapping("/users")
    public ResponseEntity<?> getAllUsers() {
        System.out.println("Admin API access by: " + SecurityContextHolder.getContext().getAuthentication().getName());
        System.out.println("Authorities: " + SecurityContextHolder.getContext().getAuthentication().getAuthorities());
        try {
            List<User> users = userService.getAllUsers();
            return ResponseEntity.ok(Map.of("success", true, "data", users, "count", users.size()));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/role")
    public ResponseEntity<?> updateUserRoles(@PathVariable String id, @RequestBody Set<String> roles) {
        try {
            return userService.updateUserRoles(id, roles)
                    .map(user -> ResponseEntity.ok(Map.of("success", true, "message", "User roles updated", "data", user)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        }
    }

    @PutMapping("/users/{id}/status")
    public ResponseEntity<?> updateUserStatus(@PathVariable String id, @RequestParam boolean enabled) {
        try {
            return userService.updateUserStatus(id, enabled)
                    .map(user -> ResponseEntity.ok(Map.of("success", true, "message", "User status updated", "data", user)))
                    .orElse(ResponseEntity.status(HttpStatus.NOT_FOUND).body(Map.of("success", false, "message", "User not found")));
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(Map.of("success", false, "message", e.getMessage()));
        }
    }
}