package com.example.health.service;

import java.util.List;
import com.example.health.model.Ambulance;

public interface AmbulanceService {
  Ambulance save(Ambulance a);
  Ambulance update(String id, Ambulance a);
  void delete(String id);
  Ambulance findById(String id);
  List<Ambulance> findAll();
}
