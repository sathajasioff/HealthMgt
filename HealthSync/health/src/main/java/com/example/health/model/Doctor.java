package com.example.health.model;

import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "doctors")
public class Doctor {
    @Id
    private String id;

    private String name;
    private String speciality;
    private Integer experience; // years
    private String phone;
    private String email;
    private Double fees;
    private Boolean availableToday;
    private Double rating;
    private String imageUrl; // served via /uploads/**
    private String userId; // reference to users collection

    private List<AvailabilitySlot> availability; // weekly/adhoc slots

    @Data
    @NoArgsConstructor
    @AllArgsConstructor
    public static class AvailabilitySlot {
        private String day; // e.g. MONDAY
        private String startTime; // HH:mm
        private String endTime;   // HH:mm
    }
}
