package com.example.health.service.impl;

import java.time.Instant;
import java.util.List;
import java.util.ArrayList;
import java.util.Objects;

import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import com.example.health.model.Pharmacy;
import com.example.health.model.Prescription;
import com.example.health.repository.PrescriptionRepository;
import com.example.health.service.PharmacyService;
import com.example.health.service.PrescriptionService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PrescriptionServiceImpl implements PrescriptionService {

    private final PrescriptionRepository prescriptionRepository;
    private final PharmacyService pharmacyService;

    @Override
    public Prescription save(Prescription prescription) {
        return prescriptionRepository.save(prescription);
    }

    @Override
    public List<Prescription> findByPatient(String patientId) {
        return prescriptionRepository.findByPatientIdOrderBySubmittedDateDesc(patientId);
    }

    @Override
    public List<Prescription> findByPharmacy(String pharmacyId) {
        return prescriptionRepository.findByPharmacyIdOrderBySubmittedDateDesc(pharmacyId);
    }

    @Override
    public Prescription upload(String patientId, String patientName, Pharmacy pharmacyInput, MultipartFile file, String notes) throws Exception {
        Pharmacy pharmacy = pharmacyService.findOrCreate(pharmacyInput);
        Prescription p = new Prescription();
        p.setPatientId(patientId);
        p.setPatientName(patientName);
        p.setPharmacyId(pharmacy != null ? pharmacy.getId() : null);
        p.setPharmacyName(pharmacy != null ? pharmacy.getName() : (pharmacyInput != null ? pharmacyInput.getName() : null));
        p.setFileName(file != null ? file.getOriginalFilename() : null);
        p.setContentType(file != null ? file.getContentType() : null);
        p.setFileContent(file != null ? file.getBytes() : null);
        p.setNotes(notes);
        p.setStatus("Pending");
        p.setSubmittedDate(Instant.now());
        return prescriptionRepository.save(p);
    }

    @Override
    public byte[] getFileContent(String id) {
        return prescriptionRepository.findById(id).map(Prescription::getFileContent).orElse(null);
    }

    @Override
    public Prescription updateStatus(String id, String status) {
        return prescriptionRepository.findById(id).map(p -> {
            p.setStatus(status);
            return prescriptionRepository.save(p);
        }).orElse(null);
    }

    @Override
    public Prescription quote(String id, List<Prescription.Item> items) {
        // delegate with defaults: 0 tax, 0 delivery, null currency
        return quote(id, items, 0.0, 0.0, null);
    }

    @Override
    public Prescription patientConfirm(String id, boolean accept) {
        return prescriptionRepository.findById(id).map(p -> {
            p.setPatientConfirmed(accept);
            if (accept) {
                p.setStatus("Approved");
            } else {
                p.setStatus("Rejected");
            }
            return prescriptionRepository.save(p);
        }).orElse(null);
    }

    @Override
    public Prescription quote(String id, List<Prescription.Item> items, Double taxRate, Double deliveryFee, String currency) {
        return prescriptionRepository.findById(id).map(p -> {
            final List<Prescription.Item> itemsLocal = (items != null) ? new ArrayList<>(items) : List.of();
            double subtotal = 0.0;
            for (Prescription.Item it : itemsLocal) {
                if (it == null) continue;
                int qty = Objects.requireNonNullElse(it.getQuantity(), 0);
                double unit = Objects.requireNonNullElse(it.getUnitPrice(), 0.0);
                it.setLineTotal(qty * unit);
                subtotal += it.getLineTotal();
            }
            double rate = taxRate == null ? 0.0 : taxRate;
            double delFee = deliveryFee == null ? 0.0 : deliveryFee;
            double taxAmount = subtotal * rate;
            double grandTotal = subtotal + taxAmount + delFee;

            p.setItems(itemsLocal);
            p.setTotalPrice(grandTotal); // keep for backward compatibility
            p.setSubtotal(subtotal);
            p.setTaxAmount(taxAmount);
            p.setDeliveryFee(delFee);
            p.setGrandTotal(grandTotal);
            p.setCurrency(currency);
            p.setQuotedAt(Instant.now());
            p.setPatientConfirmed(null);
            p.setStatus("Quoted");
            if (p.getBillNumber() == null || p.getBillNumber().isBlank()) {
                String base = id != null ? id : ("RX" + System.currentTimeMillis());
                p.setBillNumber("BILL-" + base.substring(Math.max(0, base.length() - 6)).toUpperCase());
            }
            return prescriptionRepository.save(p);
        }).orElse(null);
    }
}
