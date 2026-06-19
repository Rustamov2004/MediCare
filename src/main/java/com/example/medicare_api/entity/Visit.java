package com.example.medicare_api.entity;

import com.example.medicare_api.enums.PaymentType;
import com.example.medicare_api.enums.VisitStatus;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "visits")
public class Visit {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne
    private Patient patient;

    @ManyToOne
    private User doctor;

    @ManyToOne
    private MedicalService service;

    private Double price;

    @Enumerated(EnumType.STRING)
    private VisitStatus status;

    @Enumerated(EnumType.STRING)
    private PaymentType paymentType;

    // SHU YERNI TO'G'IRLADIK: Nomini createdAt qildik
    private LocalDateTime createdAt = LocalDateTime.now();

    private String reason;
    // Visit.java klassiga qo'shing
    private String procedure;
    private String diagnosis;

    private Long adminId;

    // Hamshira tomonidan kiritiladigan dastlabki ko'rik ma'lumotlari
    private String bloodPressure; // Masalan: "120/80"
    private Double temperature;   // Harorat (°C)
    private Double weight;        // Vazn (kg)
}
