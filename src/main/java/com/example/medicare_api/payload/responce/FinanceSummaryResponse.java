package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FinanceSummaryResponse {
    private Double monthlyIncome;
    private Double yearlyIncome;
    private Double totalSalaries;
    private Double netProfit;
}