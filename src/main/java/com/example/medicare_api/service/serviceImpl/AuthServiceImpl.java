package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.request.LoginRequest;
import com.example.medicare_api.payload.responce.JwtResponse;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.security.JwtTokenProvider;
import com.example.medicare_api.service.AuthService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Service;

import com.example.medicare_api.entity.SystemLog;
import com.example.medicare_api.repository.SystemLogRepository;
import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class AuthServiceImpl implements AuthService {

    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider tokenProvider;
    private final UserRepository userRepository;
    private final SystemLogRepository systemLogRepository;

    @Override
    public JwtResponse login(LoginRequest loginRequest) {
        Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                        loginRequest.getUserName(),
                        loginRequest.getPassword()
                )
        );

        SecurityContextHolder.getContext().setAuthentication(authentication);

        String jwt = tokenProvider.generateToken(authentication);
        User user = userRepository.findByUsername(loginRequest.getUserName())
                .orElseThrow(() -> new RuntimeException("User not found"));

        String clinicName = "MediCare";
        if (user.getRole() == com.example.medicare_api.enums.Role.ADMIN) {
            checkSubscription(user);
            if (user.getClinicName() != null && !user.getClinicName().isEmpty()) {
                clinicName = user.getClinicName();
            }
        } else if (user.getAdminId() != null) {
            User admin = userRepository.findById(user.getAdminId()).orElse(null);
            if (admin != null) {
                checkSubscription(admin);
                if (admin.getClinicName() != null && !admin.getClinicName().isEmpty()) {
                    clinicName = admin.getClinicName();
                }
            }
        }

        // Tizimga kirish logi
        systemLogRepository.save(SystemLog.builder()
                .performedBy(user)
                .adminId(user.getAdminId() != null ? user.getAdminId() : user.getId())
                .actionType("LOGIN")
                .description(user.getFullName() + " tizimga kirdi")
                .createdAt(LocalDateTime.now())
                .build());

        return JwtResponse.builder()
                .token(jwt)
                .type("Bearer")
                .username(user.getUsername())
                .role(user.getRole())
                .fullName(user.getFullName())
                .clinicName(clinicName)
                .build();
    }

    private void checkSubscription(User admin) {
        if (!admin.isSubscriptionActive()) {
            throw new RuntimeException("SUBSCRIPTION_EXPIRED: Klinika obunasi to'xtatilgan. Iltimos, Super Admin bilan bog'laning.");
        }
        if (admin.getSubscriptionEndDate() != null && admin.getSubscriptionEndDate().isBefore(java.time.LocalDate.now())) {
            throw new RuntimeException("SUBSCRIPTION_EXPIRED: Klinika obunasi muddati tugagan (" + admin.getSubscriptionEndDate() + "). Iltimos, Super Admin bilan bog'laning.");
        }
    }
}
