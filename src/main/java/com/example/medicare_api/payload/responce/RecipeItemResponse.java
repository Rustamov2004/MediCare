package com.example.medicare_api.payload.responce;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeItemResponse {
    private Long id;
    private Long inventoryItemId;
    private String inventoryItemName;
    private String unit;
    private int quantityRequired;
}
