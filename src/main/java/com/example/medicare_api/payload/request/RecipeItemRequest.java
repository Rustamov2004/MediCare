package com.example.medicare_api.payload.request;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class RecipeItemRequest {
    private Long inventoryItemId;
    private int quantityRequired;
}
