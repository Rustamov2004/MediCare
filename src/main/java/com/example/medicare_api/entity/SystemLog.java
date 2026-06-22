package com.example.medicare_api.entity;

import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "system_logs")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLog {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // Har bir xodim (kim qildi)
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "performed_by_id")
    private User performedBy;

    // Qaysi klinikaga tegishli ekanligi (filter uchun)
    private Long adminId;

    private String actionType; // LOGIN, LOGOUT, PROFILE_UPDATE, PASSWORD_CHANGE, vb.

    @Column(columnDefinition = "TEXT")
    private String description;

    @Column(columnDefinition = "TEXT")
    private String details; // Eski va yangi qiymatlarni JSON shaklida saqlaymiz

    private LocalDateTime createdAt;
}
