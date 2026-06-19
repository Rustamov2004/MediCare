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

    private String name; // Masalan: "Nevropatolog ko'rigi" yoki "Ukul qilish"
    private Double price;

    private boolean isCheckup; // true bo'lsa ko'rik, false bo'lsa muolaja

    // CHECKUP xizmatlar uchun: qaysi mutaxassislikka tegishli (masalan: "Kardiolog", "Nevrolog")
    // PROCEDURE xizmatlar uchun null bo'ladi
    private String specialization;

    // Doctor bilan bevosita bog'lash uchun
    private Long doctorId;

    @Enumerated(EnumType.STRING)
    private ServiceType type;

    private Long adminId;

    @OneToMany(mappedBy = "service", cascade = CascadeType.ALL, orphanRemoval = true)
    private java.util.List<ServiceRecipeItem> recipes = new java.util.ArrayList<>();
}
