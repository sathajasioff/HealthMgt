package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Facility;
import com.example.health.repository.FacilityRepository;
import com.example.health.service.FacilityService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class FacilityServiceImpl implements FacilityService {
  private final FacilityRepository facilityRepository;

  @Override
  public Facility save(Facility f) {
    if (f.getCreatedAt() == null) f.setCreatedAt(Instant.now());
    return facilityRepository.save(f);
  }

  @Override
  public Facility update(String id, Facility f) {
    return facilityRepository.findById(id).map(existing -> {
      existing.setName(f.getName());
      existing.setType(f.getType());
      existing.setLocation(f.getLocation());
      existing.setStatus(f.getStatus());
      existing.setMetadata(f.getMetadata());
      return facilityRepository.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) {
    facilityRepository.deleteById(id);
  }

  @Override
  public Facility findById(String id) {
    return facilityRepository.findById(id).orElse(null);
  }

  @Override
  public List<Facility> findAll() {
    return facilityRepository.findAll();
  }
}
