package com.example.health.controller;

import com.example.health.model.EmergencyRequest;
import com.example.health.service.EmergencyRequestService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/emergency")
@CrossOrigin(
    origins = {"http://localhost:5173", "http://localhost:3000"},
    allowCredentials = "true",
    maxAge = 3600,
    methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.OPTIONS},
    allowedHeaders = {"Content-Type", "Authorization", "X-Role", "X-User-Id"},
    exposedHeaders = {"Authorization"}
)
@RequiredArgsConstructor
public class EmergencyController {

    private final EmergencyRequestService service;

    private boolean hasRole(String header, String... allowed) {
        if (header == null) return false;
        String r = header.toUpperCase();
        for (String a : allowed) if (r.equals(a)) return true;
        return false;
    }

    // Patient creates emergency
    @PostMapping
    public ResponseEntity<EmergencyRequest> create(@RequestBody EmergencyRequest req,
        @RequestHeader(value = "X-Role", required = false) String role) {
        System.out.println("[Emergency] CREATE requested by role=" + role + " patient=" + req.getPatientName());
        if (!hasRole(role, "PATIENT", "ADMIN")) return ResponseEntity.status(403).build();
        EmergencyRequest saved = service.create(req);
        System.out.println("[Emergency] CREATED id=" + saved.getId());
        return ResponseEntity.ok(saved);
    }

    // Paramedic/Hospital staff list emergencies
    @GetMapping
    public ResponseEntity<List<EmergencyRequest>> list(
        @RequestHeader(value = "X-Role", required = false) String role) {
        System.out.println("[Emergency] LIST requested by role=" + role);
        if (!hasRole(role, "PARAMEDIC", "ADMIN", "HOSPITAL_STAFF")) return ResponseEntity.status(403).build();
        List<EmergencyRequest> all = service.listAll();
        System.out.println("[Emergency] LIST size=" + all.size());
        return ResponseEntity.ok(all);
    }

    // Assign ambulance (Paramedic/Admin)
    @PutMapping("/{id}/assign")
    public ResponseEntity<EmergencyRequest> assign(@PathVariable String id,
        @RequestBody Map<String, String> body,
        @RequestHeader(value = "X-Role", required = false) String role,
        @RequestHeader(value = "X-User-Id", required = false) String userId) {
        System.out.println("[Emergency] ASSIGN id=" + id + " by role=" + role + " userId=" + userId + " ambulance=" + body.get("ambulanceId"));
        if (!hasRole(role, "PARAMEDIC", "ADMIN")) return ResponseEntity.status(403).build();
        String ambulanceId = body.get("ambulanceId");
        EmergencyRequest updated = service.assign(id, ambulanceId, userId);
        System.out.println("[Emergency] ASSIGNED -> status=" + (updated!=null?updated.getStatus():"null"));
        return ResponseEntity.ok(updated);
    }

    // Update status (Paramedic/Admin)
    @PutMapping("/{id}/status")
    public ResponseEntity<EmergencyRequest> updateStatus(@PathVariable String id,
        @RequestBody Map<String, String> body,
        @RequestHeader(value = "X-Role", required = false) String role) {
        System.out.println("[Emergency] STATUS id=" + id + " by role=" + role + " -> " + body.get("status"));
        if (!hasRole(role, "PARAMEDIC", "ADMIN")) return ResponseEntity.status(403).build();
        String status = body.get("status");
        EmergencyRequest updated = service.updateStatus(id, status);
        return ResponseEntity.ok(updated);
    }
}
