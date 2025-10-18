package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.SupportServiceItem;
import com.example.health.repository.SupportServiceRepository;
import com.example.health.service.SupportServiceService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class SupportServiceServiceImpl implements SupportServiceService {
  private final SupportServiceRepository repo;

  @Override
  public SupportServiceItem save(SupportServiceItem s) {
    if (s.getCreatedAt() == null) s.setCreatedAt(Instant.now());
    if (s.getQuantity() == null) s.setQuantity(0);
    if (s.getAvailable() == null) s.setAvailable(0);
    return repo.save(s);
  }

  @Override
  public SupportServiceItem update(String id, SupportServiceItem s) {
    return repo.findById(id).map(existing -> {
      existing.setName(s.getName());
      existing.setCategory(s.getCategory());
      existing.setQuantity(s.getQuantity());
      existing.setAvailable(s.getAvailable());
      existing.setStatus(s.getStatus());
      existing.setLocation(s.getLocation());
      existing.setNotes(s.getNotes());
      return repo.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) { repo.deleteById(id); }

  @Override
  public SupportServiceItem findById(String id) { return repo.findById(id).orElse(null); }

  @Override
  public List<SupportServiceItem> findAll() { return repo.findAll(); }
}
