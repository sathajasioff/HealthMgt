package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.MedicalRecord;
import com.example.health.repository.MedicalRecordRepository;
import com.example.health.service.MedicalRecordService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalRecordServiceImpl implements MedicalRecordService {

    private final MedicalRecordRepository repo;

    @Override
    public MedicalRecord create(MedicalRecord record) {
        record.setId(null);
        record.setCreatedAt(Instant.now());
        return repo.save(record);
    }

    @Override
    public List<MedicalRecord> findByPatient(String patientId) {
        return repo.findByPatientId(patientId);
    }

    @Override
    public List<MedicalRecord> findByDoctor(String doctorId) {
        return repo.findByDoctorId(doctorId);
    }

    @Override
    public List<MedicalRecord> findByRoom(String roomId) {
        return repo.findByRoomId(roomId);
    }
}
