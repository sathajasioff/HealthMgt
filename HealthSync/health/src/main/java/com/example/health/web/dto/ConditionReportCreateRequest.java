package com.example.health.web.dto;

import lombok.Data;

@Data
public class ConditionReportCreateRequest {
    private String patientId;
    private Integer bpSystolic;
    private Integer bpDiastolic;
    private Integer pulse;
    private Integer respRate;
    private Integer spo2;
    private Double temperature;
    private String consciousnessLevel;
    private Integer painScale;
    private String allergies;
    private String medicationsGiven;
    private String injuries;
    private String notes;
}
