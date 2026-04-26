package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Collections;
import java.util.Optional;
import java.util.Set;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;

@ExtendWith(MockitoExtension.class)
class UserServiceTest {

    @Mock
    private UserRepository userRepository;

    @InjectMocks
    private UserService userService;

    @Test
    void getAllUsers_Success() {
        when(userRepository.findAll()).thenReturn(Collections.emptyList());
        var result = userService.getAllUsers();
        assertNotNull(result);
    }

    @Test
    void updateUserRoles_Success() {
        User user = User.builder().id("u1").roles(Collections.singleton("ROLE_USER")).build();
        when(userRepository.findById("u1")).thenReturn(Optional.of(user));
        when(userRepository.save(any())).thenAnswer(i -> i.getArguments()[0]);

        var result = userService.updateUserRoles("u1", Set.of("ROLE_ADMIN"));
        assertTrue(result.isPresent());
        assertTrue(result.get().getRoles().contains("ROLE_ADMIN"));
    }
}
