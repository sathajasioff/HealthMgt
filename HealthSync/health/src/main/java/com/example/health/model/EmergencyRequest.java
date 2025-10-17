package com.example.health.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Document(collection = "emergency_requests")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class EmergencyRequest {
    @Id
    private String id;
    private String patientId;
    private String patientName;
    private String contactPhone;
    private String pickupLocation;
    private String severity; // LOW, MEDIUM, HIGH, CRITICAL
    private String status; // Requested, Assigned, Completed, Cancelled
    private String assignedAmbulanceId;
    private String assignedParamedicId;
    private Instant requestedAt;
    private Instant updatedAt;
}
