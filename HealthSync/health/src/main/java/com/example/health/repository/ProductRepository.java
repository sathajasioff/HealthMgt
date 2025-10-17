package com.example.health.repository;

import java.util.List;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.Product;

public interface ProductRepository extends MongoRepository<Product, String> {
    List<Product> findByPharmacyIdAndActiveTrue(String pharmacyId);
    List<Product> findByPharmacyId(String pharmacyId);
    List<Product> findByActiveTrue();
}
