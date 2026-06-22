package com.example.medicare_api.controller;
import com.example.medicare_api.payload.request.LoginRequest;
import com.example.medicare_api.payload.responce.JwtResponse;
import com.example.medicare_api.service.AuthService;
import com.example.medicare_api.entity.SystemLog;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.repository.SystemLogRepository;
import com.example.medicare_api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import java.time.LocalDateTime;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/auth")
@RequiredArgsConstructor
public class AuthController {
    private final AuthService authService;
    private final SystemLogRepository systemLogRepository;
    private final SecurityUtils securityUtils;
    @PostMapping("/login")
    public ResponseEntity<JwtResponse> login(@RequestBody LoginRequest loginRequest) {
        JwtResponse response = authService.login(loginRequest);
        return ResponseEntity.ok(response);
    }
    @PostMapping("/logout")
    public ResponseEntity<Void> logout() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser != null) {
            systemLogRepository.save(SystemLog.builder()
                .performedBy(currentUser)
                .adminId(currentUser.getAdminId() != null ? currentUser.getAdminId() : currentUser.getId())
                .actionType("LOGOUT")
                .description(currentUser.getFullName() + " tizimdan chiqdi")
                .createdAt(LocalDateTime.now())
                .build());
        }
        return ResponseEntity.ok().build();
    }
}