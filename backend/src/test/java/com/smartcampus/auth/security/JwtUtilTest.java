package com.smartcampus.auth.security;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;

import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;

class JwtUtilTest {

    private JwtUtil jwtUtil;
    private final String secret = "mysecretkeymustbeverylongformacsha256";
    private final long expiration = 3600000;

    @BeforeEach
    void setUp() {
        jwtUtil = new JwtUtil(secret, expiration);
    }

    @Test
    void generateAndValidateToken_Success() {
        String token = jwtUtil.generateToken("test@test.com", Set.of("ROLE_USER"));
        assertNotNull(token);
        
        assertTrue(jwtUtil.validateToken(token));
        assertEquals("test@test.com", jwtUtil.extractUsername(token));
    }

    @Test
    void validateToken_Invalid_ReturnsFalse() {
        assertFalse(jwtUtil.validateToken("invalid.token.here"));
    }
}
