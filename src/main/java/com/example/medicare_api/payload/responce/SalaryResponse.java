package com.example.medicare_api.payload.responce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SalaryResponse {
    private Long userId;
    private String fullName;
    private String role;
    private String salaryType;
    private Double salaryAmount;
    private int totalVisits;
    private double totalRevenue;
    private double calculatedSalary;
    
    // Yangi qo'shilgan maydonlar
    private double totalBonus;
    private double totalPenalty;
    private double totalPaid;
    private double balance;
    
    private String workDates;
    private String restDates;
}
