package com.smartcampus.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.core.AuthenticationException;

import static org.junit.jupiter.api.Assertions.*;

class OAuth2FailureHandlerTest {

    private final OAuth2FailureHandler handler = new OAuth2FailureHandler();

    @Test
    void onAuthenticationFailure_RedirectsWithError() throws Exception {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();

        AuthenticationException exception = new AuthenticationException("Access denied") {};

        handler.onAuthenticationFailure(request, response, exception);

        String redirectUrl = response.getRedirectedUrl();
        assertNotNull(redirectUrl);
        assertTrue(redirectUrl.contains("localhost:5173/login"));
        assertTrue(redirectUrl.contains("error="));
    }
}
