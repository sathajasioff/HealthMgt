package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.Ward;

public interface WardRepository extends MongoRepository<Ward, String> {
}
