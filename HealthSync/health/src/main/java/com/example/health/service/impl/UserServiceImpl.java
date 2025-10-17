package com.example.health.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.User;
import com.example.health.repository.UserRepository;
import com.example.health.service.UserService;

import lombok.RequiredArgsConstructor;
import org.springframework.web.multipart.MultipartFile;
import com.example.health.service.StorageService;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {

    private final UserRepository userRepository;
    private final StorageService storageService;

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

    @Override
    public User findByEmail(String email) {
        return userRepository.findByEmail(email).orElse(null);
    }

    @Override
    public User findById(String id) {
        return userRepository.findById(id).orElseThrow(() -> new RuntimeException("User not found"));
    }

    @Override
    public User updateUser(String id, User updates) {
        User existing = findById(id);
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getPassword() != null && !updates.getPassword().isBlank()) existing.setPassword(updates.getPassword());
        if (updates.getRole() != null) existing.setRole(updates.getRole());
        return userRepository.save(existing);
    }

    @Override
    public User updateUserImage(String id, MultipartFile image) {
        if (image == null || image.isEmpty()) throw new RuntimeException("No image provided");
        User existing = findById(id);
        String url = storageService.store(image);
        existing.setImageUrl(url);
        return userRepository.save(existing);
    }
}
