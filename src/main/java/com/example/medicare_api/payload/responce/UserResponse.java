package com.example.medicare_api.payload.responce;

import com.example.medicare_api.enums.Role;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;


@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class UserResponse {
    private Long id;
    private String fullName;
    private String address;
    private String phone;
    private String specialization;
    private String salaryType;
    private Double salaryAmount;
    private String clinicName;
    private Role role;
    private String username;
    private String password; // used for returning generated passwords
    private String workDates;
    private String restDates;

    private java.time.LocalDate subscriptionEndDate;
    private Boolean isSubscriptionActive;
}
