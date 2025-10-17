package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.Nurse;

public interface NurseRepository extends MongoRepository<Nurse, String> {
}
