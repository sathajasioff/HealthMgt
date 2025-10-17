package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.MedicalEquipment;

public interface MedicalEquipmentRepository extends MongoRepository<MedicalEquipment, String> {
}
