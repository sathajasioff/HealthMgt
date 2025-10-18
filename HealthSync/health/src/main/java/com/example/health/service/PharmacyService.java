package com.example.health.service;

import java.util.List;
import java.util.Optional;

import com.example.health.model.Pharmacy;

public interface PharmacyService {
    List<Pharmacy> findAll();
    Pharmacy save(Pharmacy pharmacy);
    Optional<Pharmacy> findById(String id);
    Optional<Pharmacy> findByName(String name);
    Pharmacy findOrCreate(Pharmacy input);
    List<Pharmacy> findByUserId(String userId);
}
