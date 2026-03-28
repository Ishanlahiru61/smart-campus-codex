package com.smartcampus.auth.dto;

public record CreateUserRequest(String email, String password, String role) {}