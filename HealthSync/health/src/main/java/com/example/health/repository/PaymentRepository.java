package com.example.health.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.Payment;

public interface PaymentRepository extends MongoRepository<Payment, String> {
    List<Payment> findByPatientIdOrderByCreatedAtDesc(String patientId);
    List<Payment> findByPharmacyIdOrderByCreatedAtDesc(String pharmacyId);
    Payment findFirstByPrescriptionId(String prescriptionId);
}
