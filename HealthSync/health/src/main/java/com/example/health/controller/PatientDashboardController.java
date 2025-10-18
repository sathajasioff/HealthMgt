package com.example.health.controller;

import java.util.Comparator;
import java.util.List;
import java.util.stream.Collectors;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import com.example.health.model.Checkup;
import com.example.health.model.Prescription;
import com.example.health.service.CheckupService;
import com.example.health.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/patient-dashboard")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PatientDashboardController {

    private final CheckupService checkupService;
    private final PrescriptionService prescriptionService;

    @GetMapping("/{patientId}")
    public ResponseEntity<DashboardResponse> overview(@PathVariable String patientId) {
        List<Checkup> checkups = checkupService.findByPatient(patientId);
        List<Prescription> prescriptions = prescriptionService.findByPatient(patientId);

        // Latest 5 entries by created/submitted time
        List<Checkup> latestCheckups = checkups.stream()
                .sorted(Comparator.comparing(Checkup::getCreatedAt, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .collect(Collectors.toList());

        List<Prescription> latestPrescriptions = prescriptions.stream()
                .sorted(Comparator.comparing(Prescription::getSubmittedDate, Comparator.nullsLast(Comparator.naturalOrder())).reversed())
                .limit(5)
                .collect(Collectors.toList());

        DashboardResponse res = new DashboardResponse(
            latestCheckups,
            latestPrescriptions,
            checkups.size(),
            prescriptions.size()
        );
        return ResponseEntity.ok(res);
    }

    public record DashboardResponse(
        List<Checkup> latestCheckups,
        List<Prescription> latestPrescriptions,
        int totalCheckups,
        int totalPrescriptions
    ) {}
}
