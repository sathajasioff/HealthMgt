package com.example.health.service;

import java.util.List;
import com.example.health.model.Facility;

public interface FacilityService {
  Facility save(Facility f);
  Facility update(String id, Facility f);
  void delete(String id);
  Facility findById(String id);
  List<Facility> findAll();
}
