package com.example.health.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import com.example.health.model.Ward;
import com.example.health.model.Nurse;
import com.example.health.model.Facility;
import com.example.health.model.MedicalEquipment;
import com.example.health.model.SupportServiceItem;
import com.example.health.service.WardService;
import com.example.health.service.NurseService;
import com.example.health.service.FacilityService;
import com.example.health.service.MedicalEquipmentService;
import com.example.health.service.SupportServiceService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/hospital")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class HospitalController {

  private final WardService wardService;
  private final NurseService nurseService;
  private final FacilityService facilityService;
  private final MedicalEquipmentService equipmentService;
  private final SupportServiceService supportService;

  private boolean allowed(String role) {
    if (role == null) return false;
    String r = role.toUpperCase();
    return r.equals("HOSPITAL_STAFF") || r.equals("ADMIN") || r.equals("STAFF");
  }

  // Wards
  @GetMapping("/wards")
  public ResponseEntity<List<Ward>> listWards(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(wardService.findAll());
  }
  @PostMapping("/wards")
  public ResponseEntity<Ward> createWard(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody Ward w) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(wardService.save(w));
  }
  @PutMapping("/wards/{id}")
  public ResponseEntity<Ward> updateWard(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody Ward w) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    Ward res = wardService.update(id, w);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }
  @DeleteMapping("/wards/{id}")
  public ResponseEntity<Void> deleteWard(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    wardService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Nurses
  @GetMapping("/nurses")
  public ResponseEntity<List<Nurse>> listNurses(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(nurseService.findAll());
  }
  @PostMapping("/nurses")
  public ResponseEntity<Nurse> createNurse(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody Nurse n) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(nurseService.save(n));
  }
  @PutMapping("/nurses/{id}")
  public ResponseEntity<Nurse> updateNurse(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody Nurse n) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    Nurse res = nurseService.update(id, n);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }
  @DeleteMapping("/nurses/{id}")
  public ResponseEntity<Void> deleteNurse(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    nurseService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Facilities
  @GetMapping("/facilities")
  public ResponseEntity<List<Facility>> listFacilities(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(facilityService.findAll());
  }
  @PostMapping("/facilities")
  public ResponseEntity<Facility> createFacility(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody Facility f) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(facilityService.save(f));
  }
  @PutMapping("/facilities/{id}")
  public ResponseEntity<Facility> updateFacility(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody Facility f) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    Facility res = facilityService.update(id, f);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }
  @DeleteMapping("/facilities/{id}")
  public ResponseEntity<Void> deleteFacility(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    facilityService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Medical Equipment
  @GetMapping("/equipment")
  public ResponseEntity<List<MedicalEquipment>> listEquipment(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(equipmentService.findAll());
  }

  @PostMapping("/equipment")
  public ResponseEntity<MedicalEquipment> createEquipment(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody MedicalEquipment e) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(equipmentService.save(e));
  }

  @PutMapping("/equipment/{id}")
  public ResponseEntity<MedicalEquipment> updateEquipment(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody MedicalEquipment e) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    MedicalEquipment res = equipmentService.update(id, e);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }

  @DeleteMapping("/equipment/{id}")
  public ResponseEntity<Void> deleteEquipment(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    equipmentService.delete(id);
    return ResponseEntity.noContent().build();
  }

  // Support Services (Wheelchairs, Stretchers, Transport Staff)
  @GetMapping("/support")
  public ResponseEntity<List<SupportServiceItem>> listSupport(@RequestHeader(value = "X-Role", required = false) String role) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(supportService.findAll());
  }

  @PostMapping("/support")
  public ResponseEntity<SupportServiceItem> createSupport(@RequestHeader(value = "X-Role", required = false) String role, @RequestBody SupportServiceItem s) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    return ResponseEntity.ok(supportService.save(s));
  }

  @PutMapping("/support/{id}")
  public ResponseEntity<SupportServiceItem> updateSupport(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id, @RequestBody SupportServiceItem s) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    SupportServiceItem res = supportService.update(id, s);
    return res == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(res);
  }

  @DeleteMapping("/support/{id}")
  public ResponseEntity<Void> deleteSupport(@RequestHeader(value = "X-Role", required = false) String role, @PathVariable String id) {
    if (!allowed(role)) return ResponseEntity.status(403).build();
    supportService.delete(id);
    return ResponseEntity.noContent().build();
  }
}
