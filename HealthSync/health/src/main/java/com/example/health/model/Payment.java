package com.example.health.model;

import java.time.Instant;
import java.util.ArrayList;
import java.util.List;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Pattern;
import jakarta.validation.constraints.PositiveOrZero;
import jakarta.validation.constraints.Size;

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
    @NotBlank
    private String patientId;
    @NotBlank
    private String pharmacyId;

    // snapshot of items from prescription at time of payment
    @NotNull
    @Size(min = 1)
    private List<Prescription.Item> items = new ArrayList<>();

    @NotNull
    @PositiveOrZero
    private Double subtotal;
    @NotNull
    @PositiveOrZero
    private Double taxAmount;
    @NotNull
    @PositiveOrZero
    private Double deliveryFee;
    @NotNull
    @PositiveOrZero
    private Double grandTotal;
    @NotBlank
    @Size(min = 3, max = 3)
    private String currency;
    @NotBlank
    private String billNumber;

    @NotBlank
    @Pattern(regexp = "Pending|Paid|Failed|Cancelled")
    private String status; // Pending, Paid, Failed, Cancelled
    @NotBlank
    @Pattern(regexp = "wallet|creditCard|transfer|insurance")
    private String method; // wallet, creditCard, transfer
    private String transactionId;

    @NotNull
    private Instant createdAt;
    private Instant paidAt;

    // Insurance support
    private byte[] insuranceDoc;
    private String insuranceDocContentType;
    private String insuranceProvider;
    private String insurancePolicyNumber;
    private String insuranceMemberId;
}
