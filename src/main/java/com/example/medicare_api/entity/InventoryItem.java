package com.example.medicare_api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "inventory_items")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String name;
    private String description;
    
    private int quantity;
    private String unit; // e.g., "dona", "quti", "ml"
    
    private int lowStockThreshold; // qachon ogohlantirish berish kerak
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "category_id")
    private InventoryCategory category;
    
    private Long adminId; // Qaysi klinikaga tegishli ekanligi
}
