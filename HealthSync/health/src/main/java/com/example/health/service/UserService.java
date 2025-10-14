package com.example.health.service;

import java.util.List;

import com.example.health.model.User;

public interface UserService {
    User registerUser(User user);
    User loginUser(String email, String password);
    List<User> getAllUsers();
}
