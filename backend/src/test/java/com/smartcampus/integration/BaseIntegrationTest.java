package com.smartcampus.integration;

import com.smartcampus.auth.security.*;
import com.smartcampus.auth.service.EmailService;
import com.smartcampus.auth.util.EncryptionUtil;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.boot.test.mock.mockito.MockBean;

/**
 * Base class for integration tests.
 *
 * Uses Flapdoodle Embedded MongoDB — no Docker required.
 * Spring Boot auto-detects the Flapdoodle dependency on the test classpath and
 * starts an in-process MongoDB automatically.
 *
 * Security filters are disabled so tests can call API endpoints directly.
 */
@SpringBootTest
@AutoConfigureMockMvc(addFilters = false)
public abstract class BaseIntegrationTest {

    // Mock out the security infrastructure so the ApplicationContext loads
    // without needing real JWT secrets, OAuth2 config, etc.
    @MockBean
    protected JwtUtil jwtUtil;

    @MockBean
    protected JwtAuthenticationFilter jwtAuthenticationFilter;

    @MockBean
    protected OAuth2SuccessHandler oAuth2SuccessHandler;

    @MockBean
    protected OAuth2FailureHandler oAuth2FailureHandler;

    @MockBean
    protected HttpCookieOAuth2AuthorizationRequestRepository cookieRepository;

    @MockBean
    protected CustomUserDetailsService customUserDetailsService;

    @MockBean
    protected EncryptionUtil encryptionUtil;

    @MockBean
    protected EmailService emailService;
}
