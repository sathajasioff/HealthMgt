package com.example.health.service;

import java.util.List;
import com.example.health.model.Nurse;

public interface NurseService {
  Nurse save(Nurse n);
  Nurse update(String id, Nurse n);
  void delete(String id);
  Nurse findById(String id);
  List<Nurse> findAll();
}
