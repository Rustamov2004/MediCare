package com.example.medicare_api.entity;

import com.example.medicare_api.enums.Role;
import jakarta.persistence.*;
import lombok.*;



@Entity
@Table(name = "users")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class User {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    private String fullName;
    private String address;

    private String salaryType; // 'DAILY', 'MONTHLY', 'PERCENTAGE'
    private Double salaryAmount; // Maosh summasi yoki Foiz miqdori (0-100)

    private String phone;
    private String specialization; // Mutaxassisligi (Doktor va Medsestra uchun)
    private String clinicName; // Klinika nomi (Faqat ADMIN uchun)
    @Column(columnDefinition = "TEXT")
    private String workDates; // Masalan: "2026-06-18,2026-06-20"
    @Column(columnDefinition = "TEXT")
    private String restDates;

    private String username;
    private String password;
    
    // For UI display
    private String plainPassword;

    @Enumerated(EnumType.STRING)
    private Role role;

    private boolean active = true;

    // Subscription details for ADMINs
    private java.time.LocalDate subscriptionEndDate;
    private boolean isSubscriptionActive = true;

    private Long adminId;
}
