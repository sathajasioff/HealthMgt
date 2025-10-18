package com.example.health.repository;

import java.util.List;
import java.util.Optional;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.Checkup;

public interface CheckupRepository extends MongoRepository<Checkup, String> {
    List<Checkup> findByPatientId(String patientId);
    List<Checkup> findByDoctorId(String doctorId);
    List<Checkup> findByDoctorIdAndScheduledDate(String doctorId, String scheduledDate);
    Optional<Checkup> findFirstByRoomId(String roomId);
}
