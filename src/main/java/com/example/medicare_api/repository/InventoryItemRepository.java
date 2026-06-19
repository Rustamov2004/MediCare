package com.example.medicare_api.repository;

import com.example.medicare_api.entity.InventoryItem;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface InventoryItemRepository extends JpaRepository<InventoryItem, Long> {
    List<InventoryItem> findAllByAdminId(Long adminId);
}
