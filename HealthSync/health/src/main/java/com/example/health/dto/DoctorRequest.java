package com.example.health.dto;

import java.util.List;

import com.example.health.model.Doctor.AvailabilitySlot;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.Min;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorRequest {
    @NotBlank
    private String name;
    @NotBlank
    private String speciality;
    @NotNull
    @Min(0)
    private Integer experience;
    private String phone;
    @Email
    private String email;
    private String password; // optional; when present, can be used to create linked user
    @NotNull
    @Min(0)
    private Double fees;
    private Boolean availableToday;
    @Min(0)
    private Double rating;
    private List<AvailabilitySlot> availability;
}
