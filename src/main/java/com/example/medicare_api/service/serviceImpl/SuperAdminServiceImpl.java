package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.enums.Role;
import com.example.medicare_api.mapper.UserMapper;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class SuperAdminServiceImpl implements SuperAdminService {

    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    @Override
    public UserResponse createAdmin(UserRequest request) {
        // Generate logic from name (Ali Valiyev -> ali_valiyev)
        String baseUsername = request.getFullName().toLowerCase().trim().replaceAll("\\s+", "_");
        String username = baseUsername;
        int counter = 1;
        while (userRepository.existsByUsername(username)) {
            username = baseUsername + "_" + counter;
            counter++;
        }

        // Generate a random 6-character password
        String rawPassword = java.util.UUID.randomUUID().toString().substring(0, 6);

        User entity = new User();
        entity.setFullName(request.getFullName());
        entity.setPhone(request.getPhone());
        entity.setAddress(request.getAddress());
        entity.setUsername(username);
        entity.setPassword(passwordEncoder.encode(rawPassword));
        entity.setPlainPassword(rawPassword);
        entity.setRole(Role.ADMIN);
        entity.setActive(true);
        // Default 1 oylik obuna
        entity.setSubscriptionEndDate(request.getSubscriptionEndDate() != null ? request.getSubscriptionEndDate() : java.time.LocalDate.now().plusMonths(1));
        entity.setSubscriptionActive(request.getIsSubscriptionActive() != null ? request.getIsSubscriptionActive() : true);
        entity.setClinicName(request.getClinicName() != null ? request.getClinicName() : "Yangi Klinika");
        // adminId is null because ADMIN is the root of the tenant

        User savedUser = userRepository.save(entity);

        // Hack to return the generated raw password back to UI for the first time
        UserResponse response = userMapper.toResponse(savedUser);
        response.setPassword(rawPassword); // Show this in the modal

        return response;
    }

    @Override
    public UserResponse updateAdmin(Long id, UserRequest request) {
        User entity = userRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Admin topilmadi!"));
        entity.setFullName(request.getFullName());
        entity.setPhone(request.getPhone());
        entity.setAddress(request.getAddress());
        if (request.getClinicName() != null) {
            entity.setClinicName(request.getClinicName());
        }
        if (request.getSubscriptionEndDate() != null) {
            entity.setSubscriptionEndDate(request.getSubscriptionEndDate());
        }
        if (request.getIsSubscriptionActive() != null) {
            entity.setSubscriptionActive(request.getIsSubscriptionActive());
        }
        // Parolni faqat kiritilgan bo'lsa yangilash
        if (request.getPassword() != null && !request.getPassword().isEmpty()) {
            entity.setPassword(passwordEncoder.encode(request.getPassword()));
            entity.setPlainPassword(request.getPassword());
        }
        return userMapper.toResponse(userRepository.save(entity));
    }

    @Override
    public List<UserResponse> getAllAdmins() {
        return userMapper.toResponseList(userRepository.findAllByRole(Role.ADMIN));
    }

    @Override
    public void deleteAdmin(Long id) {
        userRepository.deleteById(id);
    }
}
