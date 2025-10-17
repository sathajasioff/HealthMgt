package com.example.health.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "checkups")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Checkup {
    @Id
    private String id;

    private String doctorId;
    private String doctorName;
    private String speciality;

    private String patientId;
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    private String healthIssue;
    private String time; // display string e.g. 10:30 AM 2025-10-15
    private String scheduledDate; // YYYY-MM-DD
    private String roomId; // video room id

    private String status; // Waiting, Confirmed, In Progress, Completed, Cancelled

    private Instant createdAt;
}
