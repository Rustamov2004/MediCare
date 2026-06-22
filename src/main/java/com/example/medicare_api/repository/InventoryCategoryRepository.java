package com.example.medicare_api.repository;
import com.example.medicare_api.entity.InventoryCategory;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface InventoryCategoryRepository extends JpaRepository<InventoryCategory, Long> {
    List<InventoryCategory> findAllByAdminId(Long adminId);
}