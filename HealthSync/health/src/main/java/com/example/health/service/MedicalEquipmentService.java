package com.example.health.service;

import java.util.List;

import com.example.health.model.MedicalEquipment;

public interface MedicalEquipmentService {
  MedicalEquipment save(MedicalEquipment e);
  MedicalEquipment update(String id, MedicalEquipment e);
  void delete(String id);
  MedicalEquipment findById(String id);
  List<MedicalEquipment> findAll();
}
