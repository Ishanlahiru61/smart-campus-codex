package com.smartcampus.auth.security;

import org.junit.jupiter.api.Test;
import org.springframework.mock.web.MockHttpServletRequest;
import org.springframework.mock.web.MockHttpServletResponse;
import org.springframework.security.oauth2.core.endpoint.OAuth2AuthorizationRequest;

import jakarta.servlet.http.Cookie;

import static org.junit.jupiter.api.Assertions.*;

class HttpCookieOAuth2AuthorizationRequestRepositoryTest {

    private final HttpCookieOAuth2AuthorizationRequestRepository repository = new HttpCookieOAuth2AuthorizationRequestRepository();

    @Test
    void saveAndLoadAuthorizationRequest_Success() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        OAuth2AuthorizationRequest authRequest = OAuth2AuthorizationRequest.authorizationCode()
                .authorizationUri("http://example.com")
                .clientId("id")
                .state("state")
                .redirectUri("http://redirect.com")
                .build();
        
        repository.saveAuthorizationRequest(authRequest, request, response);
        
        Cookie cookie = response.getCookie(HttpCookieOAuth2AuthorizationRequestRepository.OAUTH2_AUTHORIZATION_REQUEST_COOKIE_NAME);
        assertNotNull(cookie);
        
        request.setCookies(cookie);
        OAuth2AuthorizationRequest loaded = repository.loadAuthorizationRequest(request);
        assertNotNull(loaded);
        assertEquals("state", loaded.getState());
    }

    @Test
    void removeAuthorizationRequest_Success() {
        MockHttpServletRequest request = new MockHttpServletRequest();
        MockHttpServletResponse response = new MockHttpServletResponse();
        
        repository.saveAuthorizationRequest(null, request, response);
        assertNull(repository.loadAuthorizationRequest(request));
    }
}
