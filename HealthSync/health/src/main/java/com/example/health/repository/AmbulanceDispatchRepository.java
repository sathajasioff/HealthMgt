package com.example.health.repository;

import org.springframework.data.mongodb.repository.MongoRepository;
import com.example.health.model.AmbulanceDispatch;
import java.util.List;

public interface AmbulanceDispatchRepository extends MongoRepository<AmbulanceDispatch, String> {
  List<AmbulanceDispatch> findByParamedicIdOrderByRequestedAtDesc(String paramedicId);
  AmbulanceDispatch findTopByPatientIdOrderByRequestedAtDesc(String patientId);
}
