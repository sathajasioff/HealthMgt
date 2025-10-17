package com.example.health.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.MedicalRecord;

public interface MedicalRecordRepository extends MongoRepository<MedicalRecord, String> {
    List<MedicalRecord> findByPatientId(String patientId);
    List<MedicalRecord> findByDoctorId(String doctorId);
    List<MedicalRecord> findByRoomId(String roomId);
}
