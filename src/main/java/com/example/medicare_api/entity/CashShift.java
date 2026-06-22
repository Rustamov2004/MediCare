package com.example.medicare_api.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@Entity
@Table(name = "cash_shifts")
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class CashShift {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private Double expectedCash;
    private Double actualCash;
    private Double cardAmount; 
    private Double actualCard;
    private Double differenceAmount;
    @Enumerated(EnumType.STRING)
    private ShiftStatus status;
    @Column(columnDefinition = "TEXT")
    private String comment;
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "closed_by_user_id")
    private User closedBy;
    public enum ShiftStatus {
        OPEN, CLOSED
    }
}