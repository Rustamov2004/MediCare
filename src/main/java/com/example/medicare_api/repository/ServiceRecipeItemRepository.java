package com.example.medicare_api.repository;
import com.example.medicare_api.entity.ServiceRecipeItem;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
@Repository
public interface ServiceRecipeItemRepository extends JpaRepository<ServiceRecipeItem, Long> {
    List<ServiceRecipeItem> findByServiceId(Long serviceId);
    void deleteByServiceId(Long serviceId);
}