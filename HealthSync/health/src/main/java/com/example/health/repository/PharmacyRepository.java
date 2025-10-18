package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.Pharmacy;
import java.util.Optional;
import java.util.List;

public interface PharmacyRepository extends MongoRepository<Pharmacy, String> {
    Optional<Pharmacy> findByNameIgnoreCase(String name);
    List<Pharmacy> findByUserId(String userId);
}
