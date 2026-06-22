package com.example.medicare_api.entity;
import com.example.medicare_api.enums.ServiceType;
import jakarta.persistence.*;
import lombok.*;
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "medicalsevices")
public class MedicalService {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String name; 
    private Double price;
    private boolean isCheckup; 
    private String specialization;
    private Long doctorId;
    @Enumerated(EnumType.STRING)
    private ServiceType type;
    private Long adminId;
    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ServiceRecipeItem> recipes = new java.util.ArrayList<>();
}