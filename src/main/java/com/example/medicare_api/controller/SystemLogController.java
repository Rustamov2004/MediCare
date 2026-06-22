package com.example.medicare_api.controller;
import com.example.medicare_api.entity.SystemLog;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.responce.SystemLogResponse;
import com.example.medicare_api.repository.SystemLogRepository;
import com.example.medicare_api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import java.util.List;
import java.util.stream.Collectors;
@RestController
@RequestMapping("/api/logs")
@RequiredArgsConstructor
public class SystemLogController {
    private final SystemLogRepository systemLogRepository;
    private final SecurityUtils securityUtils;
    @GetMapping
    public ResponseEntity<List<SystemLogResponse>> getLogs() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        List<SystemLog> logs;
        if (currentUser.getRole() == com.example.medicare_api.enums.Role.SUPER_ADMIN) {
            logs = systemLogRepository.findAllByOrderByCreatedAtDesc();
        } else {
            Long adminId = securityUtils.getCurrentAdminId();
            logs = systemLogRepository.findAllByAdminIdOrderByCreatedAtDesc(adminId);
        }
        List<SystemLogResponse> responseList = logs.stream().map(log -> {
            String name = log.getPerformedBy() != null ? log.getPerformedBy().getFullName() : "Tizim";
            String role = log.getPerformedBy() != null ? log.getPerformedBy().getRole().name() : "";
            Long userId = log.getPerformedBy() != null ? log.getPerformedBy().getId() : null;
            return SystemLogResponse.builder()
                    .id(log.getId())
                    .performedById(userId)
                    .performedByName(name)
                    .performedByRole(role)
                    .actionType(log.getActionType())
                    .description(log.getDescription())
                    .details(log.getDetails())
                    .createdAt(log.getCreatedAt())
                    .build();
        }).collect(Collectors.toList());
        return ResponseEntity.ok(responseList);
    }
    @DeleteMapping
    public ResponseEntity<Void> clearLogs() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();
        if (currentUser.getRole() == com.example.medicare_api.enums.Role.SUPER_ADMIN) {
            systemLogRepository.deleteAll();
        } else {
            Long adminId = securityUtils.getCurrentAdminId();
            systemLogRepository.deleteAllByAdminId(adminId);
        }
        return ResponseEntity.noContent().build();
    }
}