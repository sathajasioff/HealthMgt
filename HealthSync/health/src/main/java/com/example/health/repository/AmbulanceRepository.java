package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.Ambulance;

public interface AmbulanceRepository extends MongoRepository<Ambulance, String> {
}
