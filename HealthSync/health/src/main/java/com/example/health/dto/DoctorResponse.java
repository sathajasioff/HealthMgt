package com.example.health.dto;

import java.util.List;

import com.example.health.model.Doctor.AvailabilitySlot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorResponse {
    private String id;
    private String name;
    private String speciality;
    private Integer experience;
    private String phone;
    private String email;
    private Double fees;
    private Boolean availableToday;
    private Double rating;
    private String imageUrl;
    private List<AvailabilitySlot> availability;
}
