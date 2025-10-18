package com.example.health.controller;

import java.util.List;
import java.util.Map;

import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.CrossOrigin;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;
import org.springframework.web.bind.annotation.PostMapping;
import org.springframework.web.bind.annotation.RequestBody;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;
import org.springframework.web.bind.annotation.PutMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.http.MediaType;
import org.springframework.web.multipart.MultipartFile;

import org.springframework.validation.annotation.Validated;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.Size;

import com.example.health.model.Payment;
import com.example.health.service.PaymentService;

import lombok.RequiredArgsConstructor;

@RestController
@RequestMapping("/api/payments")
@CrossOrigin(origins = {"http://localhost:3000", "http://localhost:5173"})
@RequiredArgsConstructor
@Validated
public class PaymentController {

    private final PaymentService paymentService;

    @PostMapping("/from-prescription/{prescriptionId}")
    public ResponseEntity<Payment> createFromPrescription(
            @PathVariable String prescriptionId,
            @RequestBody Map<String, String> body) {
        String method = body.getOrDefault("method", "creditCard");
        String deliveryMethod = body.getOrDefault("deliveryMethod", "home");
        return ResponseEntity.ok(paymentService.createFromPrescription(prescriptionId, method, deliveryMethod));
    }

    @PostMapping("/manual")
    public ResponseEntity<Payment> createManual(@Valid @RequestBody ManualBody body) {
        return ResponseEntity.ok(
            paymentService.createManualOrder(
                body.getPatientId(),
                body.getPharmacyId(),
                body.getItems(),
                body.getMethod(),
                body.getDeliveryMethod()
            )
        );
    }

    @PostMapping("/{paymentId}/paid")
    public ResponseEntity<Payment> markPaid(@PathVariable String paymentId, @RequestBody Map<String, String> body) {
        String transactionId = body.getOrDefault("transactionId", "TX-" + System.currentTimeMillis());
        return ResponseEntity.ok(paymentService.markPaid(paymentId, transactionId));
    }

    @PutMapping(value = "/{paymentId}/insurance", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<Payment> attachInsuranceAndApprove(
        @PathVariable String paymentId,
        @RequestParam("file") MultipartFile file,
        @RequestParam(value = "provider", required = false) String provider,
        @RequestParam(value = "policyNumber", required = false) String policyNumber,
        @RequestParam(value = "memberId", required = false) String memberId
    ) throws Exception {
        Payment pay = paymentService.findById(paymentId);
        if (pay == null) return ResponseEntity.notFound().build();
        pay.setInsuranceDoc(file.getBytes());
        pay.setInsuranceDocContentType(file.getContentType());
        pay.setInsuranceProvider(provider);
        pay.setInsurancePolicyNumber(policyNumber);
        pay.setInsuranceMemberId(memberId);
        pay.setMethod("insurance");
        // Make payment free
        pay.setSubtotal(0.0);
        pay.setTaxAmount(0.0);
        pay.setDeliveryFee(0.0);
        pay.setGrandTotal(0.0);
        // Persist before marking paid
        paymentService.save(pay);
        // Reuse markPaid to set status, transaction and paidAt
        paymentService.markPaid(paymentId, "INS-" + System.currentTimeMillis());
        return ResponseEntity.ok(paymentService.findById(paymentId));
    }

    @GetMapping("/patient/{patientId}")
    public ResponseEntity<List<Payment>> byPatient(@PathVariable String patientId) {
        return ResponseEntity.ok(paymentService.listByPatient(patientId));
    }

    @GetMapping("/pharmacy/{pharmacyId}")
    public ResponseEntity<List<Payment>> byPharmacy(@PathVariable String pharmacyId) {
        return ResponseEntity.ok(paymentService.listByPharmacy(pharmacyId));
    }

    @GetMapping("/prescription/{prescriptionId}")
    public ResponseEntity<Payment> byPrescription(@PathVariable String prescriptionId) {
        return ResponseEntity.ok(paymentService.findByPrescription(prescriptionId));
    }

    // Request body for manual order creation
    public static class ManualBody {
        @NotBlank
        private String patientId;
        @NotBlank
        private String pharmacyId;
        @NotNull
        @Size(min = 1)
        private java.util.List<com.example.health.model.Prescription.Item> items;
        @NotBlank
        @Pattern(regexp = "wallet|creditCard|transfer|insurance")
        private String method;
        @NotBlank
        private String deliveryMethod;

        public String getPatientId() { return patientId; }
        public void setPatientId(String patientId) { this.patientId = patientId; }
        public String getPharmacyId() { return pharmacyId; }
        public void setPharmacyId(String pharmacyId) { this.pharmacyId = pharmacyId; }
        public java.util.List<com.example.health.model.Prescription.Item> getItems() { return items; }
        public void setItems(java.util.List<com.example.health.model.Prescription.Item> items) { this.items = items; }
        public String getMethod() { return method; }
        public void setMethod(String method) { this.method = method; }
        public String getDeliveryMethod() { return deliveryMethod; }
        public void setDeliveryMethod(String deliveryMethod) { this.deliveryMethod = deliveryMethod; }
    }
}
