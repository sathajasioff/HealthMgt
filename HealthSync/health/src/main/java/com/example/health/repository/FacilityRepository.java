package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.Facility;

public interface FacilityRepository extends MongoRepository<Facility, String> {
}
