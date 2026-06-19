package com.example.medicare_api.payload.request;

import lombok.Data;

@Data
public class CloseShiftRequest {
    private Double actualCash;
    private Double actualCard;
    private String comment;
}
