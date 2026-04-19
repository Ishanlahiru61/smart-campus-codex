package com.smartcampus.auth.dto;
public record AuthResponse(String token, String type, String email, java.util.Set<String> roles) {}
