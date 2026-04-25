package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.client.authentication.OAuth2AuthenticationToken;
import org.springframework.security.oauth2.core.user.DefaultOAuth2User;
import org.springframework.security.oauth2.core.user.OAuth2User;

import java.io.IOException;
import java.util.Collections;
import java.util.Map;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.ArgumentMatchers.anyString;
import static org.mockito.Mockito.mock;
import static org.mockito.Mockito.when;

class OAuth2SuccessHandlerTest {

    private UserRepository userRepository = mock(UserRepository.class);

    private JwtUtil jwtUtil = mock(JwtUtil.class);

    private OAuth2SuccessHandler successHandler;

    private MockHttpServletRequest request;

    private MockHttpServletResponse response;

    private User validUser;

    @BeforeEach
    void setUp() {
        request = new MockHttpServletRequest();
        response = new MockHttpServletResponse();

        successHandler = new OAuth2SuccessHandler(userRepository, jwtUtil);

        validUser = User.builder()
                .email("test@smartcampus.edu")
                .roles(Set.of("USER"))
                .enabled(true)
                .build();
    }

    @Test
    void onAuthenticationSuccess_ExistingEnabledUser_RedirectsWithToken() throws IOException {
        OAuth2User oauth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                Map.of("email", "test@smartcampus.edu", "name", "Test User"),
                "email");
        Authentication authentication = new OAuth2AuthenticationToken(oauth2User, Collections.emptyList(), "google");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(validUser));
        when(jwtUtil.generateToken(anyString(), any())).thenReturn("mockJwtToken");

        successHandler.onAuthenticationSuccess(request, response, authentication);

        assertEquals("http://localhost:5173/oauth2/redirect?token=mockJwtToken", response.getRedirectedUrl());
    }

    @Test
    void onAuthenticationSuccess_UserNotFound_RedirectsWithError() throws IOException {
        OAuth2User oauth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                Map.of("email", "unknown@smartcampus.edu", "name", "Unknown User"),
                "email");
        Authentication authentication = new OAuth2AuthenticationToken(oauth2User, Collections.emptyList(), "google");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.empty());

        successHandler.onAuthenticationSuccess(request, response, authentication);

        assertEquals("http://localhost:5173/login?error=User+not+pre-approved+or+disabled+by+Admin.",
                response.getRedirectedUrl());
    }

    @Test
    void onAuthenticationSuccess_AccountDisabled_RedirectsWithError() throws IOException {
        validUser.setEnabled(false);
        OAuth2User oauth2User = new DefaultOAuth2User(
                Collections.emptyList(),
                Map.of("email", "test@smartcampus.edu", "name", "Test User"),
                "email");
        Authentication authentication = new OAuth2AuthenticationToken(oauth2User, Collections.emptyList(), "google");

        when(userRepository.findByEmail(anyString())).thenReturn(Optional.of(validUser));

        successHandler.onAuthenticationSuccess(request, response, authentication);

        assertEquals("http://localhost:5173/login?error=User+not+pre-approved+or+disabled+by+Admin.",
                response.getRedirectedUrl());
    }
}
