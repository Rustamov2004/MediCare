package com.example.medicare_api.payload.request;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalsRequest {
    private String bloodPressure; 
    private Double temperature;   
    private Double weight;        
}