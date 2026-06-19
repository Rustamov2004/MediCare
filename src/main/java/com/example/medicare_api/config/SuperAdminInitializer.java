package com.example.medicare_api.config;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.enums.Role;
import com.example.medicare_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SuperAdminInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(String... args) throws Exception {
        if (!userRepository.existsByRole(Role.SUPER_ADMIN)) {
            User superAdmin = User.builder()
                    .fullName("Asosiy Boshqaruvchi")
                    .username("superadmin")
                    .password(passwordEncoder.encode("super123"))
                    .role(Role.SUPER_ADMIN)
                    .active(true)
                    .build();
            userRepository.save(superAdmin);
            System.out.println("Default Super Admin yaratildi. Login: superadmin, Parol: super123");
        }
    }
}
