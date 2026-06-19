package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.request.ProfileUpdateRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.security.SecurityUtils;
import com.example.medicare_api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse getMyProfile() {
        User user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Foydalanuvchi topilmadi!");
        }
        UserResponse response = mapToResponse(user);
        
        if (user.getAdminId() != null) {
            User admin = userRepository.findById(user.getAdminId()).orElse(null);
            if (admin != null) {
                response.setWorkDates(admin.getWorkDates());
                response.setRestDates(admin.getRestDates());
            }
        }
        
        return response;
    }

    @Override
    public UserResponse updateMyProfile(ProfileUpdateRequest request) {
        User user = securityUtils.getCurrentUser();
        if (user == null) {
            throw new RuntimeException("Foydalanuvchi topilmadi!");
        }

        // Login bandligini tekshirish
        if (request.getUsername() != null && !request.getUsername().isBlank()) {
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), user.getId())) {
                throw new RuntimeException("Bu login avvalroq boshqa foydalanuvchi tomonidan olingan!");
            }
            user.setUsername(request.getUsername());
        }

        if (request.getFullName() != null && !request.getFullName().isBlank()) {
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank()) {
            user.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.getPassword()));
        }

        userRepository.save(user);

        return mapToResponse(user);
    }

    private UserResponse mapToResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setFullName(user.getFullName());
        response.setUsername(user.getUsername());
        response.setRole(user.getRole());
        response.setPhone(user.getPhone());
        response.setSpecialization(user.getSpecialization());
        response.setClinicName(user.getClinicName());
        response.setWorkDates(user.getWorkDates());
        response.setRestDates(user.getRestDates());
        return response;
    }
}
