package com.example.health.service;

import java.util.List;

import org.springframework.web.multipart.MultipartFile;

import com.example.health.model.Prescription;
import com.example.health.model.Pharmacy;

public interface PrescriptionService {
    Prescription save(Prescription prescription);
    List<Prescription> findByPatient(String patientId);
    List<Prescription> findByPharmacy(String pharmacyId);
    Prescription upload(String patientId, String patientName, Pharmacy pharmacy, MultipartFile file, String notes) throws Exception;
    byte[] getFileContent(String id);
    Prescription updateStatus(String id, String status);
    Prescription quote(String id, java.util.List<Prescription.Item> items);
    Prescription quote(String id, java.util.List<Prescription.Item> items, Double taxRate, Double deliveryFee, String currency);
    Prescription patientConfirm(String id, boolean accept);
}
