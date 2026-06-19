package com.example.medicare_api.entity;

import com.example.medicare_api.enums.TransactionType;
import jakarta.persistence.*;
import lombok.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "transactions")
@Builder
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
public class Transaction {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "user_id")
    private User user; // Qaysi xodimga qilingan to'lov yoki jarima

    private Long adminId; // Qaysi klinika/adminga tegishli

    private Double amount;

    @Enumerated(EnumType.STRING)
    private TransactionType type;

    private String description;

    @Column(updatable = false)
    private LocalDateTime createdAt;

    @PrePersist
    public void prePersist() {
        this.createdAt = LocalDateTime.now();
    }
}
