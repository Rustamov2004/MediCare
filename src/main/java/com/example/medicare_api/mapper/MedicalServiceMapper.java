package com.example.medicare_api.mapper;

import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.payload.responce.MedicalServiceResponse;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;

import java.util.List;
import java.util.stream.Collectors;

@Mapper
@Component
public class MedicalServiceMapper {
    public MedicalServiceResponse toResponse(MedicalService service) {
        if (service == null) return null;
        return MedicalServiceResponse.builder()
                .id(service.getId())
                .name(service.getName())
                .price(service.getPrice())
                .type(service.getType())
                .isCheckup(service.isCheckup())
                .specialization(service.getSpecialization())
                .doctorId(service.getDoctorId())
                .recipes(service.getRecipes() != null ? service.getRecipes().stream().map(r -> com.example.medicare_api.payload.responce.RecipeItemResponse.builder()
                        .id(r.getId())
                        .inventoryItemId(r.getInventoryItem().getId())
                        .inventoryItemName(r.getInventoryItem().getName())
                        .unit(r.getInventoryItem().getUnit())
                        .quantityRequired(r.getQuantityRequired())
                        .build()).collect(Collectors.toList()) : null)
                .build();
    }

    public List<MedicalServiceResponse> toResponseList(List<MedicalService> services) {
        return services.stream().map(this::toResponse).collect(Collectors.toList());
    }
}
