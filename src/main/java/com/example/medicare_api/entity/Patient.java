package com.example.medicare_api.entity;
import jakarta.persistence.*;
import lombok.*;
import java.time.LocalDateTime;
@NoArgsConstructor
@AllArgsConstructor
@Setter
@Getter
@Builder
@Entity
@Table(name = "patients")
public class Patient {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    private String fullName;
    private String address;
    private Integer age;
    private String phone;
    private LocalDateTime createdAt = LocalDateTime.now();
    private Long adminId;
}