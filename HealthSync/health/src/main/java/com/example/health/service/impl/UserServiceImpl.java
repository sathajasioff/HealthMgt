package com.example.health.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.User;
import com.example.health.repository.UserRepository;
import com.example.health.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;

    @Override
    public User registerUser(User user) {
        // Check for existing user
        if (userRepository.findByEmail(user.getEmail()).isPresent()) {
            throw new RuntimeException("User already exists with this email.");
        }

        // Validate role
        if (user.getRole() == null || user.getRole().isBlank()) {
            throw new RuntimeException("Role is required (PATIENT, DOCTOR, STAFF).");
        }

        // Save to Mongo
        return userRepository.save(user);
    }

    @Override
    public User loginUser(String email, String password) {
        return userRepository.findByEmail(email)
                .filter(u -> u.getPassword().equals(password))
                .orElseThrow(() -> new RuntimeException("Invalid email or password"));
    }

    @Override
    public List<User> getAllUsers() {
        return userRepository.findAll();
    }
}
