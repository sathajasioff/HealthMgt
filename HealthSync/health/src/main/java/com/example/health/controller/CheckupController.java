package com.example.health.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.health.model.Checkup;
import com.example.health.service.CheckupService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/checkups")
@CrossOrigin // allow all origins for checkup endpoints
@RequiredArgsConstructor
public class CheckupController {

    private final CheckupService checkupService;

    @PostMapping
    public ResponseEntity<Checkup> create(@RequestBody Checkup checkup) {
        return ResponseEntity.ok(checkupService.create(checkup));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Checkup>> byPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(checkupService.findByPatient(patientId));
    }

    @GetMapping("/doctor/{doctorId}")
    public ResponseEntity<List<Checkup>> byDoctor(@PathVariable String doctorId) {
        return ResponseEntity.ok(checkupService.findByDoctor(doctorId));
    }

    @GetMapping("/doctor/{doctorId}/booked")
    public ResponseEntity<List<String>> bookedTimes(
            @PathVariable String doctorId,
            @RequestParam("date") String scheduledDate) {
        return ResponseEntity.ok(checkupService.getBookedTimes(doctorId, scheduledDate));
    }

    @PutMapping("/{id}/status")
    public ResponseEntity<Checkup> updateStatus(@PathVariable String id, @RequestBody Map<String, String> body) {
        String status = body.get("status");
        return ResponseEntity.ok(checkupService.updateStatus(id, status));
    }

    @PutMapping("/{id}/room")
    public ResponseEntity<Checkup> updateRoom(@PathVariable String id, @RequestBody Map<String, String> body) {
        String roomId = body.get("roomId");
        return ResponseEntity.ok(checkupService.updateRoom(id, roomId));
    }

    @GetMapping("/room/{roomId}")
    public ResponseEntity<Checkup> byRoom(@PathVariable String roomId) {
        return ResponseEntity.ok(checkupService.findByRoomId(roomId));
    }
}

