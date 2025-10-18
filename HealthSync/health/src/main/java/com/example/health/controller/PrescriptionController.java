package com.example.health.controller;

import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.List;

import org.springframework.http.HttpHeaders;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.model.Pharmacy;
import com.example.health.model.Prescription;
import com.example.health.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/prescriptions")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
public class PrescriptionController {

    private final PrescriptionService prescriptionService;

    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Prescription> upload(
            @RequestParam("patientId") String patientId,
            @RequestParam(value = "patientName", required = false) String patientName,
            @RequestParam("file") MultipartFile file,
            @RequestParam(value = "notes", required = false) String notes,
            @RequestParam("pharmacyName") String pharmacyName,
            @RequestParam(value = "pharmacyAddress", required = false) String pharmacyAddress,
            @RequestParam(value = "pharmacyPhone", required = false) String pharmacyPhone,
            @RequestParam(value = "pharmacyEmail", required = false) String pharmacyEmail,
            @RequestParam(value = "pharmacyHours", required = false) String pharmacyHours,
            @RequestParam(value = "pharmacyRating", required = false) Double pharmacyRating,
            @RequestParam(value = "pharmacyStock", required = false) String pharmacyStock
    ) throws Exception {
        Pharmacy ph = new Pharmacy();
        ph.setName(pharmacyName);
        ph.setAddress(pharmacyAddress);
        ph.setPhone(pharmacyPhone);
        ph.setEmail(pharmacyEmail);
        ph.setHours(pharmacyHours);
        ph.setRating(pharmacyRating);
        ph.setStock(pharmacyStock);

        Prescription saved = prescriptionService.upload(patientId, patientName, ph, file, notes);
        return ResponseEntity.ok(saved);
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Prescription>> byPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(prescriptionService.findByPatient(patientId));
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Prescription>> byPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(prescriptionService.findByPharmacy(pharmacyId));
    }

    @GetMapping("/{id}/file")
    public ResponseEntity<byte[]> download(@PathVariable String id) {
        byte[] data = prescriptionService.getFileContent(id);
        if (data == null) return ResponseEntity.notFound().build();
        String filename = "prescription-" + id + ".bin";
        return ResponseEntity.ok()
            .header(HttpHeaders.CONTENT_DISPOSITION, "attachment; filename*=UTF-8''" + URLEncoder.encode(filename, StandardCharsets.UTF_8))
            .contentType(MediaType.APPLICATION_OCTET_STREAM)
            .body(data);
    }

    @PostMapping("/{id}/status")
    public ResponseEntity<Prescription> updateStatus(@PathVariable String id, @RequestBody StatusBody body) {
        Prescription updated = prescriptionService.updateStatus(id, body.status());
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    public record StatusBody(String status) {}

    // Quote: pharmacy selects medicines and prices
    @PostMapping("/{id}/quote")
    public ResponseEntity<Prescription> quote(@PathVariable String id, @RequestBody QuoteBody body) {
        Prescription updated = prescriptionService.quote(id, body.items());
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    public record QuoteBody(java.util.List<Prescription.Item> items) {}

    // Patient confirms or rejects the quoted medicines/prices
    @PostMapping("/{id}/confirm")
    public ResponseEntity<Prescription> confirm(@PathVariable String id, @RequestBody ConfirmBody body) {
        Prescription updated = prescriptionService.patientConfirm(id, body.accept());
        return updated == null ? ResponseEntity.notFound().build() : ResponseEntity.ok(updated);
    }

    public record ConfirmBody(boolean accept) {}
}
