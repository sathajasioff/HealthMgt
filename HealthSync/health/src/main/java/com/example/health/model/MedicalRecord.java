package com.example.health.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "medical_records")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecord {
    @Id
    private String id;

    private String patientId; // User id of patient
    private String doctorId;  // User id of doctor
    private String roomId;    // Video room id for the consultation

    // Basic patient info snapshot
    private String patientName;
    private Integer patientAge;
    private String patientGender;

    private String consultationDate; // YYYY-MM-DD

    private String chiefComplaint;
    private String symptoms;
    private String diagnosis;

    // Vitals (flat for simplicity)
    private String vitalBloodPressure;
    private String vitalHeartRate;
    private String vitalTemperature;
    private String vitalRespiratoryRate;
    private String vitalOxygenSaturation;

    // Medical details
    private String medicalHistory;
    private String allergies;
    private String currentMedications;
    private String prescribedMedications;
    private String labTests;
    private String recommendations;
    private String followUpDate; // YYYY-MM-DD
    private String notes;

    private Instant createdAt;
}
