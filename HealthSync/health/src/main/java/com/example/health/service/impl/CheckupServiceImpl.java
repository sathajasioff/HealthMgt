package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.stereotype.Service;

import com.example.health.model.Checkup;
import com.example.health.repository.CheckupRepository;
import com.example.health.service.CheckupService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class CheckupServiceImpl implements CheckupService {

    private final CheckupRepository repo;

    @Override
    public Checkup create(Checkup checkup) {
        checkup.setId(null);
        checkup.setCreatedAt(Instant.now());
        if (checkup.getStatus() == null || checkup.getStatus().isBlank()) {
            checkup.setStatus("Waiting");
        }
        return repo.save(checkup);
    }

    @Override
    public List<Checkup> findByPatient(String patientId) {
        return repo.findByPatientId(patientId);
    }

    @Override
    public List<Checkup> findByDoctor(String doctorId) {
        return repo.findByDoctorId(doctorId);
    }

    @Override
    public Checkup updateStatus(String id, String status) {
        Checkup c = repo.findById(id).orElseThrow(() -> new RuntimeException("Checkup not found"));
        c.setStatus(status);
        return repo.save(c);
    }

    @Override
    public Checkup updateRoom(String id, String roomId) {
        Checkup c = repo.findById(id).orElseThrow(() -> new RuntimeException("Checkup not found"));
        c.setRoomId(roomId);
        return repo.save(c);
    }

    @Override
    public Checkup findByRoomId(String roomId) {
        return repo.findFirstByRoomId(roomId).orElse(null);
    }

    @Override
    public List<String> getBookedTimes(String doctorId, String scheduledDate) {
        if (doctorId == null || doctorId.isBlank() || scheduledDate == null || scheduledDate.isBlank()) {
            return List.of();
        }
        return repo.findByDoctorIdAndScheduledDate(doctorId, scheduledDate)
                .stream()
                // consider only active bookings
                .filter(c -> {
                    String s = c.getStatus() == null ? "" : c.getStatus().trim().toLowerCase();
                    return !(s.contains("cancel") || s.contains("complete") || s.contains("closed") || s.contains("done"));
                })
                // normalize time to 'hh:mm AM/PM'
                .map(c -> {
                    String t = c.getTime();
                    if (t == null) return null;
                    String trimmed = t.trim();
                    java.util.regex.Matcher m = java.util.regex.Pattern.compile("(\\d{1,2}:\\d{2}\\s*[AP]M)", java.util.regex.Pattern.CASE_INSENSITIVE).matcher(trimmed);
                    if (m.find()) {
                        return m.group(1).toUpperCase().replaceAll("\\s+", " ");
                    }
                    return trimmed;
                })
                .filter(s -> s != null && !s.isBlank())
                .collect(Collectors.toList());
    }
}
