package com.example.health.model;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;
import lombok.Data;
import lombok.NoArgsConstructor;
import lombok.AllArgsConstructor;
import lombok.Builder;
import java.time.Instant;

@Document(collection = "ambulance_dispatches")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class AmbulanceDispatch {
  @Id
  private String id;
  private String ambulanceId;
  private String paramedicId; // userId of paramedic
  private String patientId;   // optional
  private String pickupLocation;
  private String dropoffLocation;
  private String status; // Requested, Dispatched, Completed, Cancelled
  private Instant requestedAt;
  private Instant dispatchedAt;
  private Instant completedAt;
  // Live tracking
  private Double latitude;
  private Double longitude;
  private Double speedKph;
  private Double headingDeg;
  private Instant lastUpdated;
}
