package com.example.medicare_api.security;

import com.example.medicare_api.entity.User;
import com.example.medicare_api.enums.Role;
import com.example.medicare_api.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
@RequiredArgsConstructor
public class SecurityUtils {

    private final UserRepository userRepository;

    public User getCurrentUser() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication == null || !authentication.isAuthenticated() || "anonymousUser".equals(authentication.getPrincipal())) {
            return null;
        }
        String username = authentication.getName();
        return userRepository.findByUsername(username).orElse(null);
    }

    public Long getCurrentAdminId() {
        User user = getCurrentUser();
        if (user == null) return null;
        if (user.getRole() == Role.SUPER_ADMIN) {
            return null; // Super Admin has no single adminId context usually, or means "ALL"
        }
        if (user.getRole() == Role.ADMIN) {
            return user.getId();
        }
        return user.getAdminId();
    }
}
