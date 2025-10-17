package com.example.health.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "medical_equipment")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalEquipment {
  @Id
  private String id;

  private String name;          // Ventilator, Dialysis Machine, Oxygen Tank, etc.
  private String type;          // Category/type
  private Integer quantity;     // Total units
  private Integer available;    // Available units
  private String status;        // Operational, Maintenance, OutOfService
  private String location;      // Building/Ward/Room
  private Instant lastMaintenance;
  private String notes;         // Additional details

  private Instant createdAt;
}
