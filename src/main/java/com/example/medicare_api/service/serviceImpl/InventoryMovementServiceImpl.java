package com.example.medicare_api.service.serviceImpl;

import com.example.medicare_api.entity.InventoryItem;
import com.example.medicare_api.entity.InventoryMovement;
import com.example.medicare_api.entity.User;
import com.example.medicare_api.repository.InventoryMovementRepository;
import com.example.medicare_api.service.InventoryMovementService;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;

@Service
@RequiredArgsConstructor
public class InventoryMovementServiceImpl implements InventoryMovementService {

    private final InventoryMovementRepository movementRepository;

    @Override
    public void logMovement(InventoryItem item, String type, int quantityChanged, String description, User performedBy) {
        if (quantityChanged == 0 && !"UPDATE".equals(type)) {
            // No movement to log if quantity hasn't changed and it's not a generic update
            // Actually, we can just log if it's explicitly called
            if (quantityChanged == 0) return;
        }

        InventoryMovement movement = InventoryMovement.builder()
                .inventoryItem(item)
                .type(type)
                .quantityChanged(quantityChanged)
                .balanceAfter(item.getQuantity())
                .description(description)
                .performedBy(performedBy)
                .createdAt(LocalDateTime.now())
                .adminId(item.getAdminId())
                .build();

        movementRepository.save(movement);
    }
}
