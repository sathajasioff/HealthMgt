package com.example.health.service;

import java.util.List;

import com.example.health.model.MedicalRecord;

public interface MedicalRecordService {
    MedicalRecord create(MedicalRecord record);
    List<MedicalRecord> findByPatient(String patientId);
    List<MedicalRecord> findByDoctor(String doctorId);
    List<MedicalRecord> findByRoom(String roomId);
}
