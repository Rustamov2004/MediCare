package com.example.medicare_api.entity;

import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "inventory_movements")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryMovement {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    // ADD, UPDATE, AUTO_DEDUCT, MANUAL_DEDUCT
    private String type;

    private int quantityChanged; // masalan: +50 yoki -2
    private int balanceAfter;    // O'zgarishdan keyingi qoldiq

    private String description;

    // Harakatni kim qildi
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    private LocalDateTime createdAt;
    
    private Long adminId;
}
