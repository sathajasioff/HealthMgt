package com.example.health.model;

import java.time.Instant;

import org.springframework.data.annotation.Id;
import org.springframework.data.mongodb.core.mapping.Document;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Document(collection = "support_services")
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SupportServiceItem {
  @Id
  private String id;

  private String name;        // Wheelchair A, Stretcher B, Transport Staff
  private String category;    // WHEELCHAIR | STRETCHER | TRANSPORT_STAFF
  private Integer quantity;   // total units or headcount
  private Integer available;  // available units or headcount
  private String status;      // Available, InUse, Maintenance, OffDuty
  private String location;    // building/ward or department assignment
  private String notes;       // extra details

  private Instant createdAt;
}
