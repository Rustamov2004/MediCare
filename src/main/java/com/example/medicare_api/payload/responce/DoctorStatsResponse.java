package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class DoctorStatsResponse {
    private Long doctorId;
    private String doctorName;
    private String specialization;
    private long todayPatients;    
    private long totalPatients;    
    private double totalRevenue;   
    private double calculatedSalary; 
    private String salaryType;
    private Double salaryAmount;
}