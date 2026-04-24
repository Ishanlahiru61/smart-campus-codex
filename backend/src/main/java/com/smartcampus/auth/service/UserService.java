package com.smartcampus.auth.service;

import com.smartcampus.auth.entity.User;
import com.smartcampus.auth.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;
import java.util.Set;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository userRepository;

    public List<User> getAllUsers() {
        return userRepository.findAll();
    }

    public Optional<User> getUserById(String id) {
        return userRepository.findById(id);
    }

    public Optional<User> updateUserRoles(String id, Set<String> roles) {
        return userRepository.findById(id).map(user -> {
            user.setRoles(roles);
            return userRepository.save(user);
        });
    }

    public Optional<User> updateUserStatus(String id, boolean enabled) {
        return userRepository.findById(id).map(user -> {
            user.setEnabled(enabled);
            return userRepository.save(user);
        });
    }
}
