package com.example.health.service;

import java.util.List;

import com.example.health.model.Payment;

public interface PaymentService {
    Payment createFromPrescription(String prescriptionId, String method, String deliveryMethod);
    Payment markPaid(String paymentId, String transactionId);
    List<Payment> listByPatient(String patientId);
    List<Payment> listByPharmacy(String pharmacyId);
    Payment findByPrescription(String prescriptionId);
    Payment findById(String id);

    Payment createManualOrder(String patientId, String pharmacyId, java.util.List<com.example.health.model.Prescription.Item> items, String method, String deliveryMethod);

    Payment save(Payment p);
}
