package com.example.health.service.impl;

import com.example.health.model.EmergencyRequest;
import com.example.health.repository.EmergencyRequestRepository;
import com.example.health.service.EmergencyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.Instant;
import java.util.List;
import org.springframework.data.domain.Sort;

@Service
@RequiredArgsConstructor
public class EmergencyRequestServiceImpl implements EmergencyRequestService {
    private final EmergencyRequestRepository repo;

    @Override
    public EmergencyRequest create(EmergencyRequest req) {
        req.setId(null);
        req.setStatus(req.getStatus() == null ? "Requested" : req.getStatus());
        req.setRequestedAt(Instant.now());
        req.setUpdatedAt(Instant.now());
        return repo.save(req);
    }

    @Override
    public List<EmergencyRequest> listAll() {
        return repo.findAll(Sort.by(Sort.Direction.DESC, "requestedAt"));
    }

    @Override
    public EmergencyRequest findById(String id) {
        return repo.findById(id).orElse(null);
    }

    @Override
    public EmergencyRequest assign(String id, String ambulanceId, String paramedicId) {
        EmergencyRequest r = findById(id);
        if (r == null) return null;
        r.setAssignedAmbulanceId(ambulanceId);
        r.setAssignedParamedicId(paramedicId);
        r.setStatus("Assigned");
        r.setUpdatedAt(Instant.now());
        return repo.save(r);
    }

    @Override
    public EmergencyRequest updateStatus(String id, String status) {
        EmergencyRequest r = findById(id);
        if (r == null) return null;
        r.setStatus(status);
        r.setUpdatedAt(Instant.now());
        return repo.save(r);
    }
}
