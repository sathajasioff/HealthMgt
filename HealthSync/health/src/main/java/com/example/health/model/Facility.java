package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Document(collection = "facilities")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Facility {
  @Id
  private String id;
  private String name;
  private String type;     // ICU, Lab, Cafeteria, etc.
  private String location; // building/wing/floor
  private String status;   // Operational, Maintenance, Closed
  private String metadata; // JSON or notes
  private Instant createdAt;
}
