package com.example.medicare_api.entity;

import jakarta.persistence.*;
import lombok.*;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "medicalRecord")
public class MedicalRecord {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @OneToOne
    private Visit visit;
    @Column(columnDefinition = "TEXT")
    private String diagnosis; // Tashxis
    @Column(columnDefinition = "TEXT")
    private String treatment; // Muolaja tavsiyasi
    private boolean needsProcedure; // Agar muolaja yozilsa true bo'ladi

    private Long adminId;
}
