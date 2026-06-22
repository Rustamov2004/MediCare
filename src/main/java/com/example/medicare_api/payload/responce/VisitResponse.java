package com.example.medicare_api.payload.responce;
import com.example.medicare_api.enums.ServiceType;
import com.example.medicare_api.enums.VisitStatus;
import jakarta.persistence.EnumType;
import jakarta.persistence.Enumerated;
import lombok.*;
import java.time.LocalDateTime;
@Setter
@Getter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class VisitResponse {
   private Long id;
   private Long patientId;
   private String patientName;
   private String patientPhone;
   private String patientAddress;
   private Integer patientAge;
   private Long doctorId;
   private String doctorName;
   private Long serviceId;
   @Enumerated(value = EnumType.STRING)
   private ServiceType serviceName;
   private String serviceTitle;
   private Double price;
   private VisitStatus status;
   private LocalDateTime time;
   private String reason;
   private String procedure; 
   private String diagnosis;
   private String paymentType;
   private String bloodPressure;
   private Double temperature;
   private Double weight;
}