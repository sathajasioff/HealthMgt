package com.example.health.service.impl;

import java.util.List;
import java.util.Optional;

import org.springframework.stereotype.Service;

import com.example.health.model.Pharmacy;
import com.example.health.repository.PharmacyRepository;
import com.example.health.service.PharmacyService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PharmacyServiceImpl implements PharmacyService {
    private final PharmacyRepository pharmacyRepository;

    @Override
    public List<Pharmacy> findAll() {
        return pharmacyRepository.findAll();
    }

    @Override
    public Pharmacy save(Pharmacy pharmacy) {
        return pharmacyRepository.save(pharmacy);
    }

    @Override
    public Optional<Pharmacy> findById(String id) {
        return pharmacyRepository.findById(id);
    }

    @Override
    public Optional<Pharmacy> findByName(String name) {
        return pharmacyRepository.findByNameIgnoreCase(name);
    }

    @Override
    public Pharmacy findOrCreate(Pharmacy input) {
        if (input == null) return null;
        return findByName(input.getName()).orElseGet(() -> pharmacyRepository.save(input));
    }

    @Override
    public List<Pharmacy> findByUserId(String userId) {
        return pharmacyRepository.findByUserId(userId);
    }
}
