package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.request.ProfileUpdateRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.security.SecurityUtils;
import com.example.medicare_api.entity.SystemLog;
import com.example.medicare_api.entity.Notification;
import com.example.medicare_api.repository.SystemLogRepository;
import com.example.medicare_api.repository.NotificationRepository;
import com.example.medicare_api.security.JwtTokenProvider;
import com.example.medicare_api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import com.fasterxml.jackson.databind.ObjectMapper;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@Service
@RequiredArgsConstructor
public class ProfileServiceImpl implements ProfileService {

    private final UserRepository userRepository;
    private final SecurityUtils securityUtils;
    private final PasswordEncoder passwordEncoder;
    private final SystemLogRepository systemLogRepository;
    private final NotificationRepository notificationRepository;
    private final ObjectMapper objectMapper;
    private final JwtTokenProvider jwtTokenProvider;

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

        Map<String, Map<String, String>> changes = new HashMap<>();

        // Login bandligini tekshirish
        if (request.getUsername() != null && !request.getUsername().isBlank() && !request.getUsername().equals(user.getUsername())) {
            if (userRepository.existsByUsernameAndIdNot(request.getUsername(), user.getId())) {
                throw new RuntimeException("Bu login avvalroq boshqa foydalanuvchi tomonidan olingan!");
            }
            Map<String, String> change = new HashMap<>();
            change.put("old", user.getUsername());
            change.put("new", request.getUsername());
            changes.put("Login", change);
            user.setUsername(request.getUsername());
        }

        if (request.getFullName() != null && !request.getFullName().isBlank() && !request.getFullName().equals(user.getFullName())) {
            Map<String, String> change = new HashMap<>();
            change.put("old", user.getFullName());
            change.put("new", request.getFullName());
            changes.put("F.I.SH", change);
            user.setFullName(request.getFullName());
        }

        if (request.getPhone() != null && !request.getPhone().isBlank() && !request.getPhone().equals(user.getPhone())) {
            Map<String, String> change = new HashMap<>();
            change.put("old", user.getPhone());
            change.put("new", request.getPhone());
            changes.put("Telefon", change);
            user.setPhone(request.getPhone());
        }

        if (request.getPassword() != null && !request.getPassword().isBlank() && !request.getPassword().equals(user.getPlainPassword())) {
            Map<String, String> change = new HashMap<>();
            change.put("old", "******");
            change.put("new", "Yangilandi");
            changes.put("Parol", change);
            user.setPassword(passwordEncoder.encode(request.getPassword()));
            user.setPlainPassword(request.getPassword());
        }

        userRepository.save(user);

        String detailsJson = null;
        if (!changes.isEmpty()) {
            try {
                detailsJson = objectMapper.writeValueAsString(changes);
            } catch (Exception e) {}
        }

        if (!changes.isEmpty()) {
            // Log yaratish
            systemLogRepository.save(SystemLog.builder()
                    .performedBy(user)
                    .adminId(user.getAdminId() != null ? user.getAdminId() : user.getId())
                    .actionType("PROFILE_UPDATE")
                    .description(user.getFullName() + " o'z ma'lumotlarini tahrirladi")
                    .details(detailsJson)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        // Bildirishnoma yaratish
        User targetAdmin = null;
        if (user.getRole() == com.example.medicare_api.enums.Role.ADMIN) {
            targetAdmin = userRepository.findAllByRole(com.example.medicare_api.enums.Role.SUPER_ADMIN).stream().findFirst().orElse(null);
        } else if (user.getAdminId() != null) {
            targetAdmin = userRepository.findById(user.getAdminId()).orElse(null);
        }

        if (targetAdmin != null) {
            notificationRepository.save(Notification.builder()
                    .user(targetAdmin)
                    .message(user.getFullName() + " profil ma'lumotlarini o'zgartirdi. Loglarda ko'rishingiz mumkin.")
                    .isRead(false)
                    .createdAt(LocalDateTime.now())
                    .build());
        }

        UserResponse response = mapToResponse(user);
        if (changes.containsKey("Login") || changes.containsKey("Parol")) {
            response.setToken(jwtTokenProvider.generateTokenFromUsername(user.getUsername()));
        }

        return response;
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
