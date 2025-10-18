package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.Doctor;
import java.util.Optional;

public interface DoctorRepository extends MongoRepository<Doctor, String> {
    Optional<Doctor> findByUserId(String userId);
}
