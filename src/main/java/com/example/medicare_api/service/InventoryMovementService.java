package com.example.medicare_api.service;

import com.example.medicare_api.entity.InventoryItem;
import com.example.medicare_api.entity.User;

public interface InventoryMovementService {
    void logMovement(InventoryItem item, String type, int quantityChanged, String description, User performedBy);
}
