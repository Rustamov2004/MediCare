package com.example.medicare_api.payload.responce;
import lombok.Builder;
import lombok.Data;
@Data
@Builder
public class InventoryCategoryResponse {
    private Long id;
    private String name;
}