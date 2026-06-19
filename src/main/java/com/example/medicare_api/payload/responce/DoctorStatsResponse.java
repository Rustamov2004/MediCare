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
    private long todayPatients;    // Bugungi bemorlar soni
    private long totalPatients;    // Umumiy bemorlar soni
    private double totalRevenue;   // Jami tushum
    private double calculatedSalary; // Hisoblangan maosh
    private String salaryType;
    private Double salaryAmount;
}
