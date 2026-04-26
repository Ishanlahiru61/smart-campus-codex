package com.smartcampus.auth.security;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.oauth2.core.user.OAuth2User;
import org.springframework.security.web.authentication.SimpleUrlAuthenticationSuccessHandler;
import org.springframework.stereotype.Component;

import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import java.io.IOException;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.Optional;

@Component
@RequiredArgsConstructor
public class OAuth2SuccessHandler extends SimpleUrlAuthenticationSuccessHandler {

    private final UserRepository userRepository;
    private final JwtUtil jwtUtil;

    @Override
    public void onAuthenticationSuccess(HttpServletRequest request, HttpServletResponse response,
            Authentication authentication) throws IOException {
        
        OAuth2User oAuth2User = (OAuth2User) authentication.getPrincipal();
        String email = oAuth2User.getAttribute("email");
        
        if (email == null) {
            redirectWithError(request, response, "Email could not be retrieved from OAuth2 provider.");
            return;
        }

        Optional<User> userOpt = userRepository.findByEmail(email.trim());

        if (userOpt.isEmpty() || !userOpt.get().isEnabled()) {
            redirectWithError(request, response, "User not pre-approved or disabled by Admin.");
            return;
        }

        User user = userOpt.get();
        String token = jwtUtil.generateToken(user.getEmail(), user.getRoles()); // The raw email is stored encoded or token usually embeds raw email. Passing raw email or encrypted based on requirements

        // We redirect them specifying the token so React can catch it
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/oauth2/redirect?token=" + token);
    }

    private void redirectWithError(HttpServletRequest request, HttpServletResponse response, String errorMsg) throws IOException {
        String encodedError = URLEncoder.encode(errorMsg, StandardCharsets.UTF_8);
        getRedirectStrategy().sendRedirect(request, response, "http://localhost:5173/login?error=" + encodedError);
    }
}
