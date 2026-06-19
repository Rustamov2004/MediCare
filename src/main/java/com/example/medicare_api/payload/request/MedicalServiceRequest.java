package com.example.medicare_api.payload.request;

import com.example.medicare_api.enums.ServiceType;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MedicalServiceRequest {
   private String name;
   private Double price;
   private ServiceType type ;// CHECKUP yoki PROCEDURE

   @com.fasterxml.jackson.annotation.JsonProperty("isCheckup")
   private boolean isCheckup;
    // CHECKUP uchun: qaysi mutaxassislikka tegishli (masalan: "Kardiolog", "Nevrolog")
    private String specialization;
    private Long doctorId;
    
    private java.util.List<RecipeItemRequest> recipes;
}
