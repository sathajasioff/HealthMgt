package com.example.health.controller;

import java.util.List;

import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestPart;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.dto.DoctorRequest;
import com.example.health.model.Doctor;
import com.example.health.service.DoctorService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/doctors")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class DoctorController {

    private final DoctorService doctorService;

    @PostMapping(consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Doctor> createDoctor(
            @RequestPart("request") DoctorRequest request,
            @RequestPart(value = "image", required = false) MultipartFile image
    ) {
        Doctor created = doctorService.createDoctor(request, image);
        return ResponseEntity.ok(created);
    }

    @GetMapping
    public ResponseEntity<List<Doctor>> getAll() {
        return ResponseEntity.ok(doctorService.getAllDoctors());
    }

    @PutMapping(path = "/{id}/availability", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Doctor> updateAvailability(
            @PathVariable("id") String id,
            @RequestBody List<Doctor.AvailabilitySlot> availability
    ) {
        return ResponseEntity.ok(doctorService.updateAvailability(id, availability));
    }

    @GetMapping("/by-user/{userId}")
    public ResponseEntity<Doctor> getByUser(@PathVariable String userId) {
        return ResponseEntity.ok(doctorService.findByUserId(userId));
    }

    @PutMapping(path = "/{id}", consumes = MediaType.APPLICATION_JSON_VALUE)
    public ResponseEntity<Doctor> updateDoctor(@PathVariable("id") String id, @RequestBody Doctor updates) {
        return ResponseEntity.ok(doctorService.updateDoctorDetails(id, updates));
    }

    @PutMapping(path = "/{id}/image", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Doctor> updateDoctorImage(
            @PathVariable("id") String id,
            @RequestPart("image") MultipartFile image
    ) {
        return ResponseEntity.ok(doctorService.updateDoctorImage(id, image));
    }
}
