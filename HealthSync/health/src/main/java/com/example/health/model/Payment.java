package com.example.health.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "payments")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Payment {
    @Id
    private String id;

    private String prescriptionId;
    private String patientId;
    private String pharmacyId;

    // snapshot of items from prescription at time of payment
    private List<Prescription.Item> items = new ArrayList<>();

    private Double subtotal;
    private Double taxAmount;
    private Double deliveryFee;
    private Double grandTotal;
    private String currency;
    private String billNumber;

    private String status; // Pending, Paid, Failed, Cancelled
    private String method; // wallet, creditCard, transfer
    private String transactionId;

    private Instant createdAt;
    private Instant paidAt;

    // Insurance support
    private byte[] insuranceDoc;
    private String insuranceDocContentType;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceMemberId;
}
