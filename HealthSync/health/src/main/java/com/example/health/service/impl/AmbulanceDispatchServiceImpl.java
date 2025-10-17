package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.AmbulanceDispatch;
import com.example.health.repository.AmbulanceDispatchRepository;
import com.example.health.service.AmbulanceDispatchService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class AmbulanceDispatchServiceImpl implements AmbulanceDispatchService {
  private final AmbulanceDispatchRepository dispatchRepository;

  @Override
  public AmbulanceDispatch save(AmbulanceDispatch d) {
    if (d.getRequestedAt() == null) d.setRequestedAt(Instant.now());
    return dispatchRepository.save(d);
  }

  @Override
  public AmbulanceDispatch update(String id, AmbulanceDispatch d) {
    return dispatchRepository.findById(id).map(existing -> {
      existing.setAmbulanceId(d.getAmbulanceId());
      existing.setParamedicId(d.getParamedicId());
      existing.setPatientId(d.getPatientId());
      existing.setPickupLocation(d.getPickupLocation());
      existing.setDropoffLocation(d.getDropoffLocation());
      existing.setStatus(d.getStatus());
      existing.setRequestedAt(d.getRequestedAt());
      existing.setDispatchedAt(d.getDispatchedAt());
      existing.setCompletedAt(d.getCompletedAt());
      return dispatchRepository.save(existing);
    }).orElse(null);
  }

  @Override
  public void delete(String id) {
    dispatchRepository.deleteById(id);
  }

  @Override
  public AmbulanceDispatch findById(String id) {
    return dispatchRepository.findById(id).orElse(null);
  }

  @Override
  public List<AmbulanceDispatch> findAll() {
    return dispatchRepository.findAll();
  }

  @Override
  public List<AmbulanceDispatch> findByParamedic(String paramedicId) {
    return dispatchRepository.findByParamedicIdOrderByRequestedAtDesc(paramedicId);
  }

  @Override
  public AmbulanceDispatch findLatestByPatient(String patientId) {
    return dispatchRepository.findTopByPatientIdOrderByRequestedAtDesc(patientId);
  }
}
