package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Nurse;
import com.example.health.repository.NurseRepository;
import com.example.health.service.NurseService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class NurseServiceImpl implements NurseService {
  private final NurseRepository nurseRepository;

  @Override
  public Nurse save(Nurse n) {
    if (n.getCreatedAt() == null) n.setCreatedAt(Instant.now());
    return nurseRepository.save(n);
  }

  @Override
  public Nurse update(String id, Nurse n) {
    return nurseRepository.findById(id).map(existing -> {
      existing.setName(n.getName());
      existing.setEmail(n.getEmail());
      existing.setPhone(n.getPhone());
      existing.setWardId(n.getWardId());
      existing.setShift(n.getShift());
      existing.setLicenseNumber(n.getLicenseNumber());
      existing.setStatus(n.getStatus());
      return nurseRepository.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) {
    nurseRepository.deleteById(id);
  }

  @Override
  public Nurse findById(String id) {
    return nurseRepository.findById(id).orElse(null);
  }

  @Override
  public List<Nurse> findAll() {
    return nurseRepository.findAll();
  }
}
