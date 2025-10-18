package com.example.health.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.health.model.Ambulance;
import com.example.health.model.AmbulanceDispatch;
import com.example.health.service.AmbulanceService;
import com.example.health.service.AmbulanceDispatchService;
import com.example.health.service.UserService;
import com.example.health.model.User;
import java.util.HashMap;
import java.util.Map;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/ambulance")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class AmbulanceController {

  private final AmbulanceService ambulanceService;
  private final AmbulanceDispatchService dispatchService;
  private final UserService userService;

  private boolean allowedVehicle(String role) {
    if (role == null) return false;
    String r = role.toUpperCase();
    return r.equals("PARAMEDIC") || r.equals("ADMIN") || r.equals("STAFF") || r.equals("HOSPITAL_STAFF");
  }

  @GetMapping("/dispatches/latest")
  public ResponseEntity<AmbulanceDispatch> latestForPatient(
      @RequestHeader(value = "X-Role", required = false) String role,
      @RequestHeader(value = "X-User-Id", required = false) String userId) {
    System.out.println("[Dispatch] LATEST for patient role=" + role + ", userId=" + userId);
    if (role == null || !role.equalsIgnoreCase("PATIENT") || userId == null) return ResponseEntity.status(403).build();
    AmbulanceDispatch d = dispatchService.findLatestByPatient(userId);
    return d == null ? ResponseEntity.noContent().build() : ResponseEntity.ok(d);
  }
  @GetMapping("/dispatches/{id}")
  public ResponseEntity<AmbulanceDispatch> getDispatch(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    System.out.println("[Dispatch] GET id=" + id + " by role=" + role);
    if (!allowedDispatch(role) && !(role!=null && role.toUpperCase().equals("PATIENT"))) return ResponseEntity.status(403).build();
    AmbulanceDispatch d = dispatchService.findById(id);
    return d == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(d);
  }
  private boolean allowedDispatch(String role) {
    if (role == null) return false;
    String r = role.toUpperCase();
    return r.equals("PARAMEDIC") || r.equals("ADMIN") || r.equals("HOSPITAL_STAFF");
  }

  // Vehicles
  @GetMapping("/vehicles")
  public ResponseEntity<List<Ambulance>> listAmbulances(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowedVehicle(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(ambulanceService.findAll());
  }
  @PostMapping("/vehicles")
  public ResponseEntity<Ambulance> createAmbulance(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody Ambulance a) {
    if (!allowedVehicle(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(ambulanceService.save(a));
  }
  @PutMapping("/vehicles/{id}")
  public ResponseEntity<Ambulance> updateAmbulance(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody Ambulance a) {
    if (!allowedVehicle(role)) return ResponseEntity.status(403).build();
    Ambulance res = ambulanceService.update(id, a);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }
  @DeleteMapping("/vehicles/{id}")
  public ResponseEntity<Void> deleteAmbulance(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowedVehicle(role)) return ResponseEntity.status(403).build();
    ambulanceService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Dispatches
  @GetMapping("/dispatches")
  public ResponseEntity<List<AmbulanceDispatch>> listDispatches(@RequestHeader(value = "X-Role", required = false) String role) {
    System.out.println("[Dispatch] LIST requested by role=" + role);
    if (!allowedDispatch(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(dispatchService.findAll());
  }
  @PostMapping("/dispatches")
  public ResponseEntity<AmbulanceDispatch> createDispatch(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody AmbulanceDispatch d) {
    System.out.println("[Dispatch] CREATE requested by role=" + role + " amb=" + d.getAmbulanceId() + " patient=" + d.getPatientId());
    if (!allowedDispatch(role)) return ResponseEntity.status(403).build();
    AmbulanceDispatch saved = dispatchService.save(d);
    System.out.println("[Dispatch] CREATED id=" + saved.getId());
    return ResponseEntity.ok(saved);
  }
  @PutMapping("/dispatches/{id}")
  public ResponseEntity<AmbulanceDispatch> updateDispatch(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody AmbulanceDispatch d) {
    System.out.println("[Dispatch] UPDATE id=" + id + " by role=" + role);
    if (!allowedDispatch(role)) return ResponseEntity.status(403).build();
    AmbulanceDispatch res = dispatchService.update(id, d);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }
  @PostMapping("/dispatches/{id}/validate-patient")
  public ResponseEntity<?> validateDispatchPatient(
      @RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id,
      @RequestBody Map<String, String> body
  ) {
    System.out.println("[Dispatch] VALIDATE PATIENT id=" + id + " by role=" + role);
    if (!allowedDispatch(role)) return ResponseEntity.status(403).build();
    String scannedPatientId = body == null ? null : body.get("patientId");
    if (scannedPatientId == null || scannedPatientId.isBlank()) return ResponseEntity.badRequest().body(Map.of("message", "patientId is required"));
    AmbulanceDispatch existing = dispatchService.findById(id);
    if (existing == null) return ResponseEntity.notFound().build();
    String expected = String.valueOf(existing.getPatientId() == null ? "" : existing.getPatientId());
    if (!expected.equals(String.valueOf(scannedPatientId))) {
      return ResponseEntity.badRequest().body(Map.of("message", "Scanned patient does not match this dispatch"));
    }
    // Update status to Arrived
    existing.setStatus("Arrived");
    AmbulanceDispatch saved = dispatchService.update(id, existing);
    // Load patient details (optional)
    User patient = null;
    try { patient = userService.findById(scannedPatientId); } catch (Exception ignored) {}
    Map<String, Object> resp = new HashMap<>();
    resp.put("dispatch", saved);
    resp.put("patient", patient);
    return ResponseEntity.ok(resp);
  }
  @PutMapping("/dispatches/{id}/location")
  public ResponseEntity<AmbulanceDispatch> updateLocation(
      @RequestHeader(value = "X-Role", required = false) String role,
      @PathVariable String id,
      @RequestBody AmbulanceDispatch loc) {
    System.out.println("[Dispatch] LOCATION id=" + id + " by role=" + role + " lat=" + loc.getLatitude() + ", lng=" + loc.getLongitude());
    if (role==null || !(role.equalsIgnoreCase("PARAMEDIC") || role.equalsIgnoreCase("ADMIN"))) return ResponseEntity.status(403).build();
    AmbulanceDispatch existing = dispatchService.findById(id);
    if (existing == null) return ResponseEntity.notFound().build();
    existing.setLatitude(loc.getLatitude());
    existing.setLongitude(loc.getLongitude());
    existing.setSpeedKph(loc.getSpeedKph());
    existing.setHeadingDeg(loc.getHeadingDeg());
    existing.setLastUpdated(java.time.Instant.now());
    AmbulanceDispatch saved = dispatchService.update(id, existing);
    return ResponseEntity.ok(saved);
  }
  @DeleteMapping("/dispatches/{id}")
  public ResponseEntity<Void> deleteDispatch(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    System.out.println("[Dispatch] DELETE id=" + id + " by role=" + role);
    if (!allowedDispatch(role)) return ResponseEntity.status(403).build();
    dispatchService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
