package com.smartcampus.auth.controller;

import com.smartcampus.auth.dto.AuthRequest;
import com.smartcampus.auth.dto.AuthResponse;
import com.smartcampus.auth.dto.ForgotPasswordRequest;
import com.smartcampus.auth.dto.VerifyOtpResetPasswordRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.security.JwtUtil;
import com.smartcampus.auth.service.EmailService;
import com.smartcampus.auth.util.EncryptionUtil;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.Map;
import java.util.Optional;
import java.util.Random;

@RestController
@RequestMapping("/auth")
@RequiredArgsConstructor
public class AuthController {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtUtil jwtUtil;
    private final EncryptionUtil encryptionUtil;
    private final EmailService emailService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody AuthRequest request) {
        String email = request.email().trim();
        System.out.println("Login email: " + email);
        
        Optional<User> userOpt = userRepository.findByEmail(email);
        
        if (userOpt.isEmpty()) {
            return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
        }
        
        User user = userOpt.get();
        System.out.println("User found: " + user);

        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body(Map.of("message", "Account is disabled. Please contact admin."));
        }

        if (passwordEncoder.matches(request.password(), user.getPassword())) {
            String token = jwtUtil.generateToken(request.email(), user.getRoles());
            return ResponseEntity.ok(new AuthResponse(token, "Bearer", request.email(), user.getRoles()));
        }

        return ResponseEntity.status(401).body(Map.of("message", "Invalid email or password"));
    }

    @PostMapping("/forgot-password")
    public ResponseEntity<?> forgotPassword(@RequestBody ForgotPasswordRequest request) {
        String email = request.email().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = userOpt.get();
        if (!user.isEnabled()) {
            return ResponseEntity.status(403).body("Account is disabled.");
        }

        String otp = String.format("%06d", new Random().nextInt(999999));
        user.setOtp(otp);
        user.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        user.setOtpAttempts(0);
        userRepository.save(user);

        emailService.sendOtpEmail(request.email(), otp);

        return ResponseEntity.ok("OTP sent to your email.");
    }

    @PostMapping("/verify-otp-reset-password")
    public ResponseEntity<?> verifyOtpAndResetPassword(@RequestBody VerifyOtpResetPasswordRequest request) {
        String email = request.email().trim();
        Optional<User> userOpt = userRepository.findByEmail(email);

        if (userOpt.isEmpty()) {
            return ResponseEntity.badRequest().body("User not found.");
        }

        User user = userOpt.get();

        if (user.getOtp() == null || user.getOtpExpiryTime() == null) {
            return ResponseEntity.badRequest().body("No OTP request found for this user.");
        }

        if (LocalDateTime.now().isAfter(user.getOtpExpiryTime())) {
            return ResponseEntity.badRequest().body("OTP has expired.");
        }

        int attempts = user.getOtpAttempts() != null ? user.getOtpAttempts() : 0;
        if (attempts >= 3) {
            return ResponseEntity.badRequest().body("Maximum OTP attempts reached. Please request a new OTP.");
        }

        if (!user.getOtp().equals(request.otp())) {
            user.setOtpAttempts(attempts + 1);
            userRepository.save(user);
            return ResponseEntity.badRequest().body("Invalid OTP.");
        }

        user.setPassword(passwordEncoder.encode(request.newPassword()));
        user.setOtp(null);
        user.setOtpExpiryTime(null);
        user.setOtpAttempts(0);
        userRepository.save(user);

        return ResponseEntity.ok("Password reset successfully.");
    }
}
 
