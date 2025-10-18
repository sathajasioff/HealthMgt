package com.example.health.service.impl;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.stereotype.Service;

import com.example.health.model.Payment;
import com.example.health.model.Prescription;
import com.example.health.model.Product;
import com.example.health.repository.PaymentRepository;
import com.example.health.repository.PrescriptionRepository;
import com.example.health.repository.ProductRepository;
import com.example.health.service.PaymentService;

import lombok.RequiredArgsConstructor;

@Service
@RequiredArgsConstructor
public class PaymentServiceImpl implements PaymentService {

    private final PaymentRepository paymentRepository;
    private final PrescriptionRepository prescriptionRepository;
    private final ProductRepository productRepository;

    @Override
    public Payment createFromPrescription(String prescriptionId, String method, String deliveryMethod) {
        Prescription p = prescriptionRepository.findById(prescriptionId).orElseThrow(() -> new RuntimeException("Prescription not found"));
        String normalizedMethod = method == null ? "creditCard" : method;
        if (!normalizedMethod.matches("wallet|creditCard|transfer|insurance")) {
            normalizedMethod = "creditCard";
        }
        Payment pay = Payment.builder()
            .prescriptionId(p.getId())
            .patientId(p.getPatientId())
            .pharmacyId(p.getPharmacyId())
            .items(p.getItems() == null ? new ArrayList<>() : new ArrayList<>(p.getItems()))
            .subtotal(p.getSubtotal())
            .taxAmount(p.getTaxAmount())
            .deliveryFee(p.getDeliveryFee())
            .grandTotal(p.getGrandTotal() != null ? p.getGrandTotal() : p.getTotalPrice())
            .currency(p.getCurrency())
            .billNumber(p.getBillNumber())
            .status("Pending")
            .method(normalizedMethod)
            .createdAt(Instant.now())
            .build();
        return paymentRepository.save(pay);
    }

    @Override
    public Payment markPaid(String paymentId, String transactionId) {
        Payment pay = paymentRepository.findById(paymentId).orElseThrow(() -> new RuntimeException("Payment not found"));
        pay.setStatus("Paid");
        pay.setTransactionId(transactionId);
        pay.setPaidAt(Instant.now());
        // mark prescription as Paid too
        Prescription p = prescriptionRepository.findById(pay.getPrescriptionId()).orElse(null);
        if (p != null) {
            p.setStatus("Paid");
            prescriptionRepository.save(p);

            // Decrement stock for each item that references a Product
            if (p.getItems() != null) {
                for (Prescription.Item it : p.getItems()) {
                    String prodId = it.getProductId();
                    Integer qty = it.getQuantity();
                    if (prodId == null || qty == null || qty <= 0) continue;
                    productRepository.findById(prodId).ifPresent(prod -> {
                        Integer current = prod.getStockQty();
                        if (current == null) current = 0;
                        int next = current - qty;
                        if (next < 0) next = 0;
                        prod.setStockQty(next);
                        productRepository.save(prod);
                    });
                }
            }
        }
        return paymentRepository.save(pay);
    }

    @Override
    public List<Payment> listByPatient(String patientId) {
        return paymentRepository.findByPatientIdOrderByCreatedAtDesc(patientId);
    }

    @Override
    public List<Payment> listByPharmacy(String pharmacyId) {
        return paymentRepository.findByPharmacyIdOrderByCreatedAtDesc(pharmacyId);
    }

    @Override
    public Payment findByPrescription(String prescriptionId) {
        return paymentRepository.findFirstByPrescriptionId(prescriptionId);
    }

    @Override
    public Payment findById(String id) {
        return paymentRepository.findById(id).orElse(null);
    }

    @Override
    public Payment save(Payment p) {
        return paymentRepository.save(p);
    }

    @Override
    public Payment createManualOrder(String patientId, String pharmacyId, List<Prescription.Item> items, String method, String deliveryMethod) {
        List<Prescription.Item> safeItems = items == null ? new ArrayList<>() : new ArrayList<>(items);
        double subtotal = 0.0;
        for (Prescription.Item it : safeItems) {
            double qty = it.getQuantity() == null ? 0 : it.getQuantity();
            double price = it.getUnitPrice() == null ? 0 : it.getUnitPrice();
            double line = qty * price;
            it.setLineTotal(line);
            subtotal += line;
        }
        double tax = 0.0;
        double delivery = 0.0;
        double grand = subtotal + tax + delivery;

        String normalizedMethod = method == null ? "creditCard" : method;
        if (!normalizedMethod.matches("wallet|creditCard|transfer|insurance")) {
            normalizedMethod = "creditCard";
        }

        Payment pay = Payment.builder()
            .prescriptionId(null)
            .patientId(patientId)
            .pharmacyId(pharmacyId)
            .items(safeItems)
            .subtotal(subtotal)
            .taxAmount(tax)
            .deliveryFee(delivery)
            .grandTotal(grand)
            .currency("LKR")
            .billNumber("BILL-" + System.currentTimeMillis())
            .status("Pending")
            .method(normalizedMethod)
            .createdAt(Instant.now())
            .build();
        return paymentRepository.save(pay);
    }
}
