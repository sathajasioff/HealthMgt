package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;

import com.example.health.model.SupportServiceItem;

public interface SupportServiceRepository extends MongoRepository<SupportServiceItem, String> {
}
