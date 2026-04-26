package com.smartcampus.auth.security;

import jakarta.servlet.FilterChain;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collections;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class JwtAuthenticationFilterTest {

    @Mock private JwtUtil jwtUtil;
    @Mock private CustomUserDetailsService userDetailsService;
    @Mock private FilterChain filterChain;

    @InjectMocks
    private JwtAuthenticationFilter filter;

    @Test
    void doFilter_NoAuthHeader_ContinuesChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).extractUsername(any());
    }

    @Test
    void doFilter_InvalidBearerPrefix_ContinuesChain() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Basic sometoken");
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        verify(jwtUtil, never()).extractUsername(any());
    }

    @Test
    void doFilter_ValidJwt_SetsAuthentication() throws Exception {
        String secret = "test-secret-key-must-be-very-long-32ch";
        JwtUtil realJwt = new JwtUtil(secret, 3600000L);
        String token = realJwt.generateToken("user@test.com", Set.of("ROLE_USER"));

        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer " + token);
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();

        UserDetails userDetails = User.builder()
                .username("user@test.com")
                .password("pass")
                .authorities(Collections.emptyList())
                .build();

        when(jwtUtil.extractUsername(token)).thenReturn("user@test.com");
        when(jwtUtil.validateToken(token)).thenReturn(true);
        when(userDetailsService.loadUserByUsername("user@test.com")).thenReturn(userDetails);

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNotNull(SecurityContextHolder.getContext().getAuthentication());
        assertEquals("user@test.com", SecurityContextHolder.getContext().getAuthentication().getName());
    }

    @Test
    void doFilter_InvalidJwt_ContinuesChainWithoutAuthentication() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        request.addHeader("Authorization", "Bearer invalid.token.here");
        MockHttpServletResponse response = new MockHttpServletResponse();
        SecurityContextHolder.clearContext();

        when(jwtUtil.extractUsername("invalid.token.here")).thenThrow(new RuntimeException("Invalid token"));

        filter.doFilterInternal(request, response, filterChain);

        verify(filterChain).doFilter(request, response);
        assertNull(SecurityContextHolder.getContext().getAuthentication());
    }
}
