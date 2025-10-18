package com.example.health.service;

import com.example.health.model.EmergencyRequest;

import java.util.List;

public interface EmergencyRequestService {
    EmergencyRequest create(EmergencyRequest req);
    List<EmergencyRequest> listAll();
    EmergencyRequest findById(String id);
    EmergencyRequest assign(String id, String ambulanceId, String paramedicId);
    EmergencyRequest updateStatus(String id, String status);
}
