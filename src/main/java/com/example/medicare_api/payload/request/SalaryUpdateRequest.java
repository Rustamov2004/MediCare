package com.example.medicare_api.payload.request;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class SalaryUpdateRequest {
    private String salaryType;
    private Double salaryAmount;
}