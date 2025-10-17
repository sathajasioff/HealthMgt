package com.example.health.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.Prescription;

public interface PrescriptionRepository extends MongoRepository<Prescription, String> {
    List<Prescription> findByPatientIdOrderBySubmittedDateDesc(String patientId);
    List<Prescription> findByPharmacyIdOrderBySubmittedDateDesc(String pharmacyId);
}
