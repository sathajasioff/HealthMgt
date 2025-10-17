package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Document(collection = "nurses")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Nurse {
  @Id
  private String id;
  private String name;
  private String email;
  private String phone;
  private String wardId; // reference to Ward
  private String shift;  // e.g., DAY, NIGHT
  private String licenseNumber;
  private String status; // Active, OnLeave, Inactive
  private Instant createdAt;
}
