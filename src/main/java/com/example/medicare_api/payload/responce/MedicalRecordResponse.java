package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalRecordResponse {
  private   String diagnosis;
  private   String treatment;;
  private   LocalDateTime dateTime;
  private   String doctorName;
}