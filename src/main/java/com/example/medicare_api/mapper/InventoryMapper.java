package com.example.medicare_api.mapper;

import com.example.medicare_api.entity.InventoryItem;
import com.example.medicare_api.entity.InventoryCategory;
import com.example.medicare_api.payload.request.InventoryItemRequest;
import com.example.medicare_api.payload.responce.InventoryItemResponse;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Component
public class InventoryMapper {

    public InventoryItem toEntity(InventoryItemRequest request, InventoryCategory category, Long adminId) {
        if (request == null) return null;
        InventoryItem item = new InventoryItem();
        item.setName(request.getName());
        item.setDescription(request.getDescription());
        item.setQuantity(request.getQuantity());
        item.setUnit(request.getUnit());
        item.setLowStockThreshold(request.getLowStockThreshold());
        item.setCategory(category);
        item.setAdminId(adminId);
        return item;
    }

    public InventoryItemResponse toResponse(InventoryItem item) {
        if (item == null) return null;
        return InventoryItemResponse.builder()
                .id(item.getId())
                .name(item.getName())
                .description(item.getDescription())
                .quantity(item.getQuantity())
                .unit(item.getUnit())
                .lowStockThreshold(item.getLowStockThreshold())
                .categoryId(item.getCategory() != null ? item.getCategory().getId() : null)
                .categoryName(item.getCategory() != null ? item.getCategory().getName() : null)
                .build();
    }

    public List<InventoryItemResponse> toResponseList(List<InventoryItem> items) {
        return items.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
