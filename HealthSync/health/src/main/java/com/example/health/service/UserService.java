package com.example.health.service;

import java.util.List;

import com.example.health.model.User;
import org.springframework.web.multipart.MultipartFile;

public interface UserService {
    User registerUser(User user);
    User loginUser(String email, String password);
    List<User> getAllUsers();
    User findByEmail(String email);
    User findById(String id);
    User updateUser(String id, User updates);
    User updateUserImage(String id, MultipartFile image);
}
