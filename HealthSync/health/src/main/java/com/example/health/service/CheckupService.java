package com.example.health.service;

import java.util.List;

import com.example.health.model.Checkup;

public interface CheckupService {
    Checkup create(Checkup checkup);
    List<Checkup> findByPatient(String patientId);
    List<Checkup> findByDoctor(String doctorId);
    Checkup updateStatus(String id, String status);
    Checkup updateRoom(String id, String roomId);
    Checkup findByRoomId(String roomId);
    List<String> getBookedTimes(String doctorId, String scheduledDate);
}
