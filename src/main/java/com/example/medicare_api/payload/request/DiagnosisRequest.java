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
   private String procedure; // 'treatment' o'rniga 'procedure' qilib o'zgartirdik
   private boolean sendToMonitoring; // 'needsProcedure' o'rniga 'sendToMonitoring'
   private Long procedureServiceId;
}