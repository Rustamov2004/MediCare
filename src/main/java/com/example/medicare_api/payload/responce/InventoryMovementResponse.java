package com.example.medicare_api.payload.responce;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.time.LocalDateTime;
@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class InventoryMovementResponse {
    private Long id;
    private Long inventoryItemId;
    private String type; 
    private int quantityChanged;
    private int balanceAfter;
    private String description;
    private String performedBy;
    private LocalDateTime createdAt;
}