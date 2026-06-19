package com.example.medicare_api.payload.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class PatientVisitRequest {
    private String fullName;
    private String address;
    private Integer age;
    private String phone;
    private String reason;
    private Long doctorId;   // Agar ko'rik bo'lsa tanlanadi
    private Long serviceId;
    private String paymentType;
}
