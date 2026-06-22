package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientResponse {
   private Long id;
   private String fullName;
   private String phone;
   private String address;
   private Integer age;
}