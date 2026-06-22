package com.example.medicare_api.payload.request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class DiagnosisRequest {
   private Long visitId;
   private String diagnosis;
   private String procedure; 
   private boolean sendToMonitoring; 
   private Long procedureServiceId;
}