package com.smartcampus.auth.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.smartcampus.auth.dto.AuthRequest;
import com.smartcampus.auth.dto.ForgotPasswordRequest;
import com.smartcampus.auth.dto.VerifyOtpResetPasswordRequest;
import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import com.smartcampus.auth.security.*;
import com.smartcampus.auth.service.EmailService;
import com.smartcampus.auth.util.EncryptionUtil;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.mock.mockito.MockBean;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.web.servlet.MockMvc;

import java.time.LocalDateTime;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.*;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(controllers = AuthController.class)
@AutoConfigureMockMvc(addFilters = false)
class AuthControllerTest {

    @Autowired
    private MockMvc mockMvc;

    @Autowired
    private ObjectMapper objectMapper;

    @MockBean
    private UserRepository userRepository;

    @MockBean
    private PasswordEncoder passwordEncoder;

    @MockBean
    private EmailService emailService;

    @MockBean
    private EncryptionUtil encryptionUtil;

    @MockBean
    private JwtUtil jwtUtil;

    @MockBean
    private JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    private OAuth2SuccessHandler oAuth2SuccessHandler;

    @MockBean
    private OAuth2FailureHandler oAuth2FailureHandler;

    @MockBean
    private HttpCookieOAuth2AuthorizationRequestRepository cookieRepository;

    @MockBean
    private CustomUserDetailsService customUserDetailsService;

    private User validUser;

    @BeforeEach
    void setUp() {
        validUser = User.builder()
                .email("test@smartcampus.edu")
                .password("hashedPass")
                .roles(Set.of("USER"))
                .enabled(true)
                .build();
    }

    @Test
    void login_Success() throws Exception {
        AuthRequest request = new AuthRequest("test@smartcampus.edu", "password123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(validUser));
        when(passwordEncoder.matches(eq("password123"), anyString())).thenReturn(true);
        when(jwtUtil.generateToken(anyString(), any())).thenReturn("mockJwtToken");

        mockMvc.perform(post("/auth/login")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(jsonPath("$.token").value("mockJwtToken"))
                .andExpect(jsonPath("$.email").value("test@smartcampus.edu"));
    }

    @Test
    void forgotPassword_Success() throws Exception {
        ForgotPasswordRequest request = new ForgotPasswordRequest("test@smartcampus.edu");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(validUser));

        mockMvc.perform(post("/auth/forgot-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("OTP sent to your email."));
    }

    @Test
    void verifyOtpResetPassword_Success() throws Exception {
        validUser.setOtp("123456");
        validUser.setOtpExpiryTime(LocalDateTime.now().plusMinutes(5));
        validUser.setOtpAttempts(0);

        VerifyOtpResetPasswordRequest request = new VerifyOtpResetPasswordRequest("test@smartcampus.edu", "123456", "newPassword123");
        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(validUser));
        when(passwordEncoder.encode("newPassword123")).thenReturn("newHashedPass");

        mockMvc.perform(post("/auth/verify-otp-reset-password")
                .contentType(MediaType.APPLICATION_JSON)
                .content(objectMapper.writeValueAsString(request)))
                .andExpect(status().isOk())
                .andExpect(content().string("Password reset successfully."));
    }
}
