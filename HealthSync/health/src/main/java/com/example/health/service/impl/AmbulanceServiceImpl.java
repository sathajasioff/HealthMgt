package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Ambulance;
import com.example.health.repository.AmbulanceRepository;
import com.example.health.service.AmbulanceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmbulanceServiceImpl implements AmbulanceService {
  private final AmbulanceRepository ambulanceRepository;

  @Override
  public Ambulance save(Ambulance a) {
    if (a.getCreatedAt() == null) a.setCreatedAt(Instant.now());
    return ambulanceRepository.save(a);
  }

  @Override
  public Ambulance update(String id, Ambulance a) {
    return ambulanceRepository.findById(id).map(existing -> {
      existing.setPlateNumber(a.getPlateNumber());
      existing.setType(a.getType());
      existing.setCrewIds(a.getCrewIds());
      existing.setStatus(a.getStatus());
      existing.setLocation(a.getLocation());
      existing.setEquipment(a.getEquipment());
      return ambulanceRepository.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) {
    ambulanceRepository.deleteById(id);
  }

  @Override
  public Ambulance findById(String id) {
    return ambulanceRepository.findById(id).orElse(null);
  }

  @Override
  public List<Ambulance> findAll() {
    return ambulanceRepository.findAll();
  }
}
