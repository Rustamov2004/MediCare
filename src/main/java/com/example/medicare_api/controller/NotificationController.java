package com.example.medicare_api.controller;

import com.example.medicare_api.entity.Notification;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.payload.responce.NotificationResponse;
import com.example.medicare_api.repository.NotificationRepository;
import com.example.medicare_api.security.SecurityUtils;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/notifications")
@RequiredArgsConstructor
public class NotificationController {

    private final NotificationRepository notificationRepository;
    private final SecurityUtils securityUtils;

    @GetMapping
    public ResponseEntity<List<NotificationResponse>> getMyNotifications() {
        User currentUser = securityUtils.getCurrentUser();
        if (currentUser == null) return ResponseEntity.status(401).build();

        List<NotificationResponse> list = notificationRepository.findByUserOrderByCreatedAtDesc(currentUser)
                .stream()
                .map(n -> NotificationResponse.builder()
                        .id(n.getId())
                        .message(n.getMessage())
                        .isRead(n.isRead())
                        .createdAt(n.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return ResponseEntity.ok(list);
    }

    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        notificationRepository.findById(id).ifPresent(n -> {
            notificationRepository.delete(n);
        });
        return ResponseEntity.ok().build();
    }
}
