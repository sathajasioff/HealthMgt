package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.MedicalEquipment;
import com.example.health.repository.MedicalEquipmentRepository;
import com.example.health.service.MedicalEquipmentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class MedicalEquipmentServiceImpl implements MedicalEquipmentService {
  private final MedicalEquipmentRepository repo;

  @Override
  public MedicalEquipment save(MedicalEquipment e) {
    if (e.getCreatedAt() == null) e.setCreatedAt(Instant.now());
    if (e.getQuantity() == null) e.setQuantity(0);
    if (e.getAvailable() == null) e.setAvailable(0);
    return repo.save(e);
  }

  @Override
  public MedicalEquipment update(String id, MedicalEquipment e) {
    return repo.findById(id).map(existing -> {
      existing.setName(e.getName());
      existing.setType(e.getType());
      existing.setQuantity(e.getQuantity());
      existing.setAvailable(e.getAvailable());
      existing.setStatus(e.getStatus());
      existing.setLocation(e.getLocation());
      existing.setLastMaintenance(e.getLastMaintenance());
      existing.setNotes(e.getNotes());
      return repo.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) { repo.deleteById(id); }

  @Override
  public MedicalEquipment findById(String id) { return repo.findById(id).orElse(null); }

  @Override
  public List<MedicalEquipment> findAll() { return repo.findAll(); }
}
