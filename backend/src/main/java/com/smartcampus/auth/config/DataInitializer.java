package com.smartcampus.auth.config;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.util.Set;

/**
 * DataInitializer runs automatically when the Spring Boot application starts.
 * It serves as a secure database seeding mechanism to ensure a default ADMIN user is available.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        String adminEmail = "ishanlahiru661@gmail.com";

        // Logic Flow: Application starts -> Check user collection -> If admin email NOT found -> Create admin
        // Safe duplicate prevention logic
        log.info("Checking for default admin user presence...");
        if (userRepository.findByEmail(adminEmail).isEmpty()) {
            log.info("Admin email NOT found. Creating default admin user.");

            // Create admin with encrypted password using Spring Security encoder bean
            User admin = User.builder()
                    .email(adminEmail)
                    .username("Admin")
                    .password(passwordEncoder.encode("admin123"))
                    // Assign role: ROLE_ADMIN
                    .roles(Set.of("ROLE_ADMIN"))
                    .enabled(true)
                    .build();

            // Save to MongoDB
            userRepository.save(admin);
            log.info("Default admin user created successfully and saved to MongoDB.");
        } else {
            log.info("Default admin user already exists. Skipping creation to prevent duplicates.");
        }
    }
}
