package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Document(collection = "wards")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ward {
  @Id
  private String id;
  private String name;
  private String department;
  private String floor;
  private Integer capacity;
  private Integer occupancy;
  private String notes;
  private Instant createdAt;
}
