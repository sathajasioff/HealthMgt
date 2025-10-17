package com.example.health.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.model.User;
import com.example.health.service.UserService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/users")
@CrossOrigin // allow all origins for user endpoints
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    // Register new user
    @PostMapping("/register")
    public ResponseEntity<User> register(
        @RequestBody User user,
        @org.springframework.web.bind.annotation.RequestHeader(value = "X-Role", required = false) String requesterRole
    ) {
        String requested = user.getRole() == null ? "" : user.getRole().toUpperCase();
        boolean isRestricted = requested.equals("HOSPITAL_STAFF") || requested.equals("PARAMEDIC");
        String req = requesterRole == null ? "" : requesterRole.toUpperCase();
        if (isRestricted && !(req.equals("STAFF") || req.equals("ADMIN"))) {
            return ResponseEntity.status(403).build();
        }
        return ResponseEntity.ok(userService.registerUser(user));
    }

    // Login user
    @PostMapping("/login")
    public ResponseEntity<User> login(@RequestBody User user) {
        return ResponseEntity.ok(userService.loginUser(user.getEmail(), user.getPassword()));
    }

    // View all users (for testing/admin)
    @GetMapping
    public ResponseEntity<List<User>> getAllUsers() {
        return ResponseEntity.ok(userService.getAllUsers());
    }

     // Get profile by id
    @GetMapping("/{id}")
    public ResponseEntity<User> getById(@PathVariable String id) {
        return ResponseEntity.ok(userService.findById(id));
    }

    // Update profile by id
    @PutMapping("/{id}")
    public ResponseEntity<User> update(@PathVariable String id, @RequestBody User updates) {
        return ResponseEntity.ok(userService.updateUser(id, updates));
    }

    // Update user profile image
    @PutMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<User> updateImage(@PathVariable String id, @RequestPart("image") MultipartFile image) {
        return ResponseEntity.ok(userService.updateUserImage(id, image));
    }
}
