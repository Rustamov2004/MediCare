package com.example.medicare_api.payload.responce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class StatsResponse {
   private Long todayPatients;
   private Long activeDoctors;
   private Double dailyRevenue;
   private Double dailyRevenueCash;
   private Double dailyRevenueCard;
   private long totalPatients;
   private long checkupCount;
   private long procedureCount;
   private Double totalIncome;
   private Double checkupIncome;
   private Double procedureIncome;
}
