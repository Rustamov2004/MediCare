package com.example.medicare_api.entity;
import jakarta.persistence.*;
import lombok.*;
@Entity
@Table(name = "inventory_categories")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class InventoryCategory {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name;
    private Long adminId; 
}