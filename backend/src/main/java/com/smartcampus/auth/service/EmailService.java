package com.smartcampus.auth.service;

import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
@Slf4j
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${spring.mail.username:noreply@smartcampus.com}")
    private String fromEmail;

    public void sendOtpEmail(String to, String otp) {
        try {
            SimpleMailMessage message = new SimpleMailMessage();
            message.setFrom(fromEmail);
            message.setTo(to);
            message.setSubject("Password Reset OTP - Smart Campus");
            message.setText("Your OTP for password reset is: " + otp
                    + "\n\nThis OTP will expire in 5 minutes. Do not share this with anyone.");

            mailSender.send(message);
            log.info("OTP sent to email: {}", to);
            
            // For dev purposes if SMTP fails
            log.info("YOUR OTP FOR PASSWORD RESET IS: {}", otp);
        } catch (Exception e) {
            log.error("Failed to send OTP email", e);
            // Even if it fails to send, log it so the user can test locally without an SMTP server configured
            log.info("YOUR OTP FOR PASSWORD RESET IS: {}", otp);
        }
    }
}
