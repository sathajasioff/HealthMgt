package com.example.health.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.health.dto.DoctorRequest;
import com.example.health.model.Doctor;

public interface DoctorService {
    Doctor createDoctor(DoctorRequest request, MultipartFile image);
    List<Doctor> getAllDoctors();
    Doctor updateAvailability(String doctorId, List<Doctor.AvailabilitySlot> availability);
    Doctor findByUserId(String userId);
    Doctor updateDoctorDetails(String doctorId, Doctor updates);
    Doctor updateDoctorImage(String doctorId, MultipartFile image);
}
