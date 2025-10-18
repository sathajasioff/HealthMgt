package com.example.health.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.index.Indexed;
import org.springframework.data.mongodb.core.mapping.Document;

import java.time.Instant;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
@Document(collection = "condition_reports")
public class ConditionReport {
    @Id
    private String id;

    @Indexed
    private String dispatchId;

    @Indexed
    private String patientId;

    private String paramedicId;

    private Instant createdAt;

    // Vitals
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer pulse;           // bpm
    private Integer respRate;        // breaths per min
    private Integer spo2;            // %
    private Double temperature;      // Celsius

    // Assessment
    private String consciousnessLevel; // e.g., AVPU or GCS summary
    private Integer painScale;         // 0-10

    // History/Interventions
    private String allergies;
    private String medicationsGiven;
    private String injuries;
    private String notes;
}
