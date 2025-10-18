package com.example.health.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "products")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Product {
    @Id
    private String id;

    private String pharmacyId;   // owner pharmacy
    private String name;         // medicine name
    private String dosageForm;   // e.g., Tablet, Syrup
    private String strength;     // e.g., 500mg

    private Double price;        // unit price
    private Integer stockQty;    // available stock
    private Boolean active;      // available for sale

    private Instant createdAt;
    private Instant updatedAt;

    private byte[] image;            // image bytes
    private String imageContentType; // e.g., image/png, image/jpeg
}
