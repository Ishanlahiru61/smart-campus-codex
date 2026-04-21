package com.smartcampus.auth.dto;

public record CreateUserRequest(String username,String email, String password, String role) {}