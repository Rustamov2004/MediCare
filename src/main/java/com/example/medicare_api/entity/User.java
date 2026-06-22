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
    private String salaryType; 
    private Double salaryAmount; 
    private String phone;
    private String specialization; 
    private String clinicName; 
    @Column(columnDefinition = "TEXT")
    private String workDates; 
    @Column(columnDefinition = "TEXT")
    private String restDates;
    private String username;
    private String password;
    private String plainPassword;
    @Enumerated(EnumType.STRING)
    private Role role;
    private boolean active = true;
    private java.time.LocalDate subscriptionEndDate;
    private boolean isSubscriptionActive = true;
    private Long adminId;
}