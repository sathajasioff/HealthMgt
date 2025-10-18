package com.example.health.controller;

import com.example.health.model.AmbulanceDispatch;
import com.example.health.service.AmbulanceDispatchService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.Instant;
import java.util.List;

// NOTE: Disabled duplicate controller. Endpoints are already provided by AmbulanceController.
// Keeping this class unannotated prevents Spring from registering it and avoids ambiguous mappings.
@RequiredArgsConstructor
public class AmbulanceDispatchController {

    private final AmbulanceDispatchService service;

    private boolean hasRole(String role, String... allowed) {
        if (role == null) return false;
        String r = role.toUpperCase();
        for (String a : allowed) if (r.equals(a)) return true;
        return false;
    }

    @GetMapping
    public ResponseEntity<List<AmbulanceDispatch>> list(
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (!hasRole(role, "PARAMEDIC", "ADMIN", "HOSPITAL_STAFF")) return ResponseEntity.status(403).build();
        // If paramedic, return their dispatches first; admin can see all
        if (hasRole(role, "PARAMEDIC") && userId != null) {
            return ResponseEntity.ok(service.findByParamedic(userId));
        }
        return ResponseEntity.ok(service.findAll());
    }

    @PostMapping
    public ResponseEntity<AmbulanceDispatch> create(
            @RequestBody AmbulanceDispatch dispatch,
            @RequestHeader(value = "X-Role", required = false) String role,
            @RequestHeader(value = "X-User-Id", required = false) String userId) {
        if (!hasRole(role, "PARAMEDIC", "ADMIN")) return ResponseEntity.status(403).build();
        if (dispatch.getParamedicId() == null && userId != null) {
            dispatch.setParamedicId(userId);
        }
        if (dispatch.getRequestedAt() == null) dispatch.setRequestedAt(Instant.now());
        if (dispatch.getStatus() == null) dispatch.setStatus("Dispatched");
        AmbulanceDispatch saved = service.save(dispatch);
        return ResponseEntity.ok(saved);
    }

    @PutMapping("/{id}")
    public ResponseEntity<AmbulanceDispatch> update(
            @PathVariable String id,
            @RequestBody AmbulanceDispatch dispatch,
            @RequestHeader(value = "X-Role", required = false) String role) {
        if (!hasRole(role, "PARAMEDIC", "ADMIN")) return ResponseEntity.status(403).build();
        AmbulanceDispatch updated = service.update(id, dispatch);
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(
            @PathVariable String id,
            @RequestHeader(value = "X-Role", required = false) String role) {
        if (!hasRole(role, "PARAMEDIC", "ADMIN")) return ResponseEntity.status(403).build();
        service.delete(id);
        return ResponseEntity.noContent().build();
    }
}
