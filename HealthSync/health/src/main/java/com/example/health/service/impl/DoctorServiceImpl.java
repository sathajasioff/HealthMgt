package com.example.health.service.impl;

import java.util.List;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.dto.DoctorRequest;
import com.example.health.mapper.DoctorMapper;
import com.example.health.model.Doctor;
import com.example.health.model.User;
import com.example.health.repository.DoctorRepository;
import com.example.health.service.DoctorService;
import com.example.health.service.StorageService;
import com.example.health.service.UserService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class DoctorServiceImpl implements DoctorService {

    private final DoctorRepository doctorRepository;
    private final StorageService storageService;
    private final DoctorMapper doctorMapper;
    private final UserService userService;

    @Override
    public Doctor createDoctor(DoctorRequest request, MultipartFile image) {
        String imageUrl = null;
        if (image != null && !image.isEmpty()) {
            imageUrl = storageService.store(image);
        }

        Doctor doctor = doctorMapper.toEntity(request, imageUrl);

        // Link to existing user if available; otherwise create if password present
        if (request.getEmail() != null && !request.getEmail().isBlank()) {
            User existing = userService.findByEmail(request.getEmail());
            if (existing != null) {
                doctor.setUserId(existing.getId());
            } else if (request.getPassword() != null && !request.getPassword().isBlank()) {
                User user = User.builder()
                        .name(request.getName())
                        .email(request.getEmail())
                        .password(request.getPassword())
                        .role("DOCTOR")
                        .build();
                User savedUser = userService.registerUser(user);
                doctor.setUserId(savedUser.getId());
            }
        }

        return doctorRepository.save(doctor);
    }

    @Override
    public List<Doctor> getAllDoctors() {
        return doctorRepository.findAll();
    }

    @Override
    public Doctor updateAvailability(String doctorId, List<Doctor.AvailabilitySlot> availability) {
        Doctor doc = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        doc.setAvailability(availability);
        return doctorRepository.save(doc);
    }

    @Override
    public Doctor findByUserId(String userId) {
        return doctorRepository.findByUserId(userId).orElse(null);
    }

    @Override
    public Doctor updateDoctorDetails(String doctorId, Doctor updates) {
        Doctor existing = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        if (updates.getName() != null) existing.setName(updates.getName());
        if (updates.getSpeciality() != null) existing.setSpeciality(updates.getSpeciality());
        if (updates.getExperience() != null) existing.setExperience(updates.getExperience());
        if (updates.getPhone() != null) existing.setPhone(updates.getPhone());
        if (updates.getEmail() != null) existing.setEmail(updates.getEmail());
        if (updates.getFees() != null) existing.setFees(updates.getFees());
        if (updates.getAvailableToday() != null) existing.setAvailableToday(updates.getAvailableToday());
        if (updates.getRating() != null) existing.setRating(updates.getRating());
        if (updates.getImageUrl() != null) existing.setImageUrl(updates.getImageUrl());
        if (updates.getAvailability() != null) existing.setAvailability(updates.getAvailability());
        return doctorRepository.save(existing);
    }

    @Override
    public Doctor updateDoctorImage(String doctorId, MultipartFile image) {
        if (image == null || image.isEmpty()) {
            throw new RuntimeException("No image provided");
        }
        Doctor existing = doctorRepository.findById(doctorId)
                .orElseThrow(() -> new RuntimeException("Doctor not found"));
        String url = storageService.store(image);
        existing.setImageUrl(url);
        return doctorRepository.save(existing);
    }
}
