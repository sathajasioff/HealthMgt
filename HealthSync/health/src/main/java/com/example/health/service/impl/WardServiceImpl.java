package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Ward;
import com.example.health.repository.WardRepository;
import com.example.health.service.WardService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class WardServiceImpl implements WardService {
  private final WardRepository wardRepository;

  @Override
  public Ward save(Ward w) {
    if (w.getCreatedAt() == null) w.setCreatedAt(Instant.now());
    if (w.getOccupancy() == null) w.setOccupancy(0);
    return wardRepository.save(w);
  }

  @Override
  public Ward update(String id, Ward w) {
    return wardRepository.findById(id).map(existing -> {
      existing.setName(w.getName());
      existing.setDepartment(w.getDepartment());
      existing.setFloor(w.getFloor());
      existing.setCapacity(w.getCapacity());
      existing.setOccupancy(w.getOccupancy());
      existing.setNotes(w.getNotes());
      return wardRepository.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) {
    wardRepository.deleteById(id);
  }

  @Override
  public Ward findById(String id) {
    return wardRepository.findById(id).orElse(null);
  }

  @Override
  public List<Ward> findAll() {
    return wardRepository.findAll();
  }
}
