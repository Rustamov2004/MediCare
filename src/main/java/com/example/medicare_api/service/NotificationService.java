package com.example.medicare_api.service;
import com.example.medicare_api.entity.InventoryItem;
public interface NotificationService {
    void sendLowStockNotification(InventoryItem item);
}