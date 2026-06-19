package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.InventoryItem;
import com.example.medicare_api.entity.Notification;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.repository.NotificationRepository;
import com.example.medicare_api.repository.UserRepository;
import com.example.medicare_api.service.NotificationService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;

@Service
@RequiredArgsConstructor
public class NotificationServiceImpl implements NotificationService {

    private final UserRepository userRepository;
    private final NotificationRepository notificationRepository;

    @Override
    public void sendLowStockNotification(InventoryItem item) {
        String msg = "⚠️ DIQQAT! Omborxonada [" + item.getName() + "] kamayib qoldi. Qoldiq: " 
            + item.getQuantity() + " " + item.getUnit();
            
        // AdminID bo'yicha shu klinikadagi hamma xodimlarga jo'natamiz
        List<User> users = item.getAdminId() != null 
            ? userRepository.findAllByAdminId(item.getAdminId()) 
            : userRepository.findAll();

        for (User u : users) {
            Notification n = Notification.builder()
                .user(u)
                .message(msg)
                .isRead(false)
                .createdAt(LocalDateTime.now())
                .build();
            notificationRepository.save(n);
        }
    }
}
