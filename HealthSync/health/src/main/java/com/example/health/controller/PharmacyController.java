package com.example.health.controller;

import java.util.List;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RestController;

import com.example.health.model.Pharmacy;
import com.example.health.service.PharmacyService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/pharmacies")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PharmacyController {

    private final PharmacyService pharmacyService;

    @GetMapping
    public ResponseEntity<List<Pharmacy>> all() {
        return ResponseEntity.ok(pharmacyService.findAll());
    }
    
    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Pharmacy>> byUser(@PathVariable String userId) {
        return ResponseEntity.ok(pharmacyService.findByUserId(userId));
    }

    @PostMapping
    public ResponseEntity<Pharmacy> create(@RequestBody Pharmacy pharmacy) {
        return ResponseEntity.ok(pharmacyService.save(pharmacy));
    }
}
