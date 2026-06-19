package com.example.medicare_api.mapper;

import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.payload.responce.VisitResponse;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import java.util.List;
import java.util.stream.Collectors;

@Mapper
@Component
public class VisitMapper {

    public VisitResponse toResponse(Visit visit) {
        if (visit == null) return null;

        return VisitResponse.builder()
                .id(visit.getId())
                .patientId(visit.getPatient() != null ? visit.getPatient().getId() : null)
                .patientName(visit.getPatient() != null ? visit.getPatient().getFullName() : "N/A")
                .patientPhone(visit.getPatient() != null ? visit.getPatient().getPhone() : "")
                .patientAddress(visit.getPatient() != null ? visit.getPatient().getAddress() : "")
                .patientAge(visit.getPatient() != null ? visit.getPatient().getAge() : null)
                .doctorId(visit.getDoctor() != null ? visit.getDoctor().getId() : null)
                .doctorName(visit.getDoctor() != null ? visit.getDoctor().getFullName() : "Biriktirilmagan")
                .serviceId(visit.getService() != null ? visit.getService().getId() : null)
                .serviceName(visit.getService() != null ? visit.getService().getType() : null)
                .serviceTitle(visit.getService() != null ? visit.getService().getName() : null)
                .price(visit.getPrice())
                .status(visit.getStatus())
                .reason(visit.getReason())
                .procedure(visit.getProcedure())
                .diagnosis(visit.getDiagnosis())
                .paymentType(visit.getPaymentType() != null ? visit.getPaymentType().name() : null)
                .time(visit.getCreatedAt())
                // Vital ko'rsatkichlar
                .bloodPressure(visit.getBloodPressure())
                .temperature(visit.getTemperature())
                .weight(visit.getWeight())
                .build();
    }

    public List<VisitResponse> toResponseList(List<Visit> visits) {
        return visits.stream().map(this::toResponse).collect(Collectors.toList());
    }
}