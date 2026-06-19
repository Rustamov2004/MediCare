package com.example.medicare_api.entity;

import jakarta.persistence.*;
import lombok.*;

@Entity
@Table(name = "service_recipe_items")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class ServiceRecipeItem {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "service_id")
    private MedicalService service;

    @ManyToOne(fetch = FetchType.EAGER)
    @JoinColumn(name = "inventory_item_id")
    private InventoryItem inventoryItem;

    private int quantityRequired;
}
