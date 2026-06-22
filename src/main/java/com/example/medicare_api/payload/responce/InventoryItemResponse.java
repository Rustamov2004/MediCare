package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryItemResponse {
    private Long id;
    private String name;
    private String description;
    private int quantity;
    private String unit;
    private int lowStockThreshold;
    private Long categoryId;
    private String categoryName;
}