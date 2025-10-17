package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;
import java.util.List;

@Document(collection = "ambulances")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Ambulance {
  @Id
  private String id;
  private String plateNumber;
  private String type; // BLS, ALS, ICU
  private List<String> crewIds; // nurses/paramedics userIds
  private String status; // Available, EnRoute, Maintenance
  private String location; // simple string for now
  private List<String> equipment; // names
  private Instant createdAt;
}
