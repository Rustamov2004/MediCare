package com.example.medicare_api.payload.request;

import com.example.medicare_api.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserRequest {
    private String fullName;
    private String address;
    private String phone;
    private String specialization;
    private String salaryType;
    private Double salaryAmount;
    private String username;
    private String password;
    private Role role;
    private String clinicName;

    private java.time.LocalDate subscriptionEndDate;
    private Boolean isSubscriptionActive;
}
