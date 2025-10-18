package com.example.health.mapper;

import org.springframework.stereotype.Component;

import com.example.health.dto.DoctorRequest;
import com.example.health.dto.DoctorResponse;
import com.example.health.model.Doctor;

@Component
public class DoctorMapper {

    public Doctor toEntity(DoctorRequest req, String imageUrl) {
        if (req == null) return null;
        return Doctor.builder()
                .name(req.getName())
                .speciality(req.getSpeciality())
                .experience(req.getExperience())
                .phone(req.getPhone())
                .email(req.getEmail())
                .fees(req.getFees())
                .availableToday(Boolean.TRUE.equals(req.getAvailableToday()))
                .rating(req.getRating() != null ? req.getRating() : 4.8)
                .imageUrl(imageUrl)
                .availability(req.getAvailability())
                .build();
    }

    public DoctorResponse toResponse(Doctor d) {
        if (d == null) return null;
        return DoctorResponse.builder()
                .id(d.getId())
                .name(d.getName())
                .speciality(d.getSpeciality())
                .experience(d.getExperience())
                .phone(d.getPhone())
                .email(d.getEmail())
                .fees(d.getFees())
                .availableToday(d.getAvailableToday())
                .rating(d.getRating())
                .imageUrl(d.getImageUrl())
                .availability(d.getAvailability())
                .build();
    }
}
