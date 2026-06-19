package com.example.medicare_api.payload.responce;

import com.example.medicare_api.enums.ServiceType;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
public class MedicalServiceResponse {
    private Long id;
    private String name;
    private Double price;
    private ServiceType type; // CHECKUP yoki PROCEDURE
    @com.fasterxml.jackson.annotation.JsonProperty("isCheckup")
    private boolean isCheckup;
    private String specialization; // CHECKUP uchun mutaxassislik nomi
    private Long doctorId;
    
    private java.util.List<RecipeItemResponse> recipes;
}
