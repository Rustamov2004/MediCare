package com.example.medicare_api.payload.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemRequest {
    private String name;
    private String description;
    private int quantity;
    private String unit;
    private int lowStockThreshold;
    private Long categoryId;
}
