package com.example.health.service;

import java.util.List;
import com.example.health.model.AmbulanceDispatch;

public interface AmbulanceDispatchService {
  AmbulanceDispatch save(AmbulanceDispatch d);
  AmbulanceDispatch update(String id, AmbulanceDispatch d);
  void delete(String id);
  AmbulanceDispatch findById(String id);
  List<AmbulanceDispatch> findAll();
  List<AmbulanceDispatch> findByParamedic(String paramedicId);
  AmbulanceDispatch findLatestByPatient(String patientId);
}
