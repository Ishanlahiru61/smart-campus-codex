package com.smartcampus.auth.dto;

public record VerifyOtpResetPasswordRequest(String email, String otp, String newPassword) {
}
