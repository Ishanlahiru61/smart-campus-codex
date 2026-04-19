package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.security.JwtUtil;
import com.smartcampus.auth.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.Map;
import java.util.Optional;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EncryptionUtil encryptionUtil;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String encryptedEmail = encryptionUtil.encrypt(request.email());
        Optional<User> userOpt = userRepository.findByEmail(encryptedEmail);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or user not found"));
        }
        
        User user = userOpt.get();

        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(Map.of("message", "Account is disabled. Please contact admin."));
        }

        if (passwordEncoder.matches(request.password(), user.getPassword())) {
            String token = jwtUtil.generateToken(request.email(), user.getRoles());
            return ResponseEntity.ok(new AuthResponse(token, "Bearer", request.email(), user.getRoles()));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }
}
