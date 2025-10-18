package com.example.health.repository;

import com.example.health.model.EmergencyRequest;
import org.springframework.data.mongodb.repository.MongoRepository;

public interface EmergencyRequestRepository extends MongoRepository<EmergencyRequest, String> {
}
