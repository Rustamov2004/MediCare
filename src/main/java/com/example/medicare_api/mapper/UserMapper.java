package com.example.medicare_api.mapper;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import lombok.NoArgsConstructor;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
@Component
public class UserMapper {
    public User toEntity(UserRequest request) {
        if (request == null) return null;
        User user = new User();
        user.setFullName(request.getFullName());
        user.setAddress(request.getAddress());
        user.setPhone(request.getPhone());
        user.setSpecialization(request.getSpecialization());
        user.setUsername(request.getUsername());
        user.setPassword(request.getPassword()); // Service'da encode qilinadi
        user.setRole(request.getRole());
        user.setSalaryType(request.getSalaryType());
        user.setSalaryAmount(request.getSalaryAmount());
        return user;
    }

    public UserResponse toResponse(User user) {
        if (user == null) return null;
        return UserResponse.builder()
                .id(user.getId())
                .fullName(user.getFullName())
                .address(user.getAddress())
                .phone(user.getPhone())
                .specialization(user.getSpecialization())
                .role(user.getRole())
                .username(user.getUsername())
                .password(user.getPlainPassword())
                .salaryType(user.getSalaryType())
                .salaryAmount(user.getSalaryAmount())
                .clinicName(user.getClinicName())
                .subscriptionEndDate(user.getSubscriptionEndDate())
                .isSubscriptionActive(user.isSubscriptionActive())
                .workDates(user.getWorkDates())
                .restDates(user.getRestDates())
                .build();
    }

    public List<UserResponse> toResponseList(List<User> users) {
        return users.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
