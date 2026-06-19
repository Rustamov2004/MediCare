package com.example.medicare_api.payload.request;

import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class VitalsRequest {
    private String bloodPressure; // Masalan: "120/80"
    private Double temperature;   // Harorat (°C)
    private Double weight;        // Vazn (kg)
}
