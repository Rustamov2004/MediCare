package com.example.medicare_api.mapper;
import com.example.medicare_api.entity.MedicalRecord;
import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.payload.responce.MedicalRecordResponse;
import org.mapstruct.Mapper;
import org.springframework.stereotype.Component;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.stream.Collectors;
@Mapper
@Component
public class MedicalRecordMapper {
    private final DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd.MM.yyyy HH:mm");
    public MedicalRecordResponse toResponse(MedicalRecord record) {
        if (record == null) return null;
        LocalDateTime createdAt = record.getVisit().getCreatedAt();
        String formattedDate = (createdAt != null) ? createdAt.format(formatter) : null;
        return MedicalRecordResponse.builder()
                .diagnosis(record.getDiagnosis())
                .treatment(record.getTreatment())
                .doctorName(record.getVisit().getDoctor() != null ?
                        record.getVisit().getDoctor().getFullName() : "Noma'lum")
                .dateTime(record.getVisit().getCreatedAt())
                .build();
    }
    public List<MedicalRecordResponse> toResponseList(List<MedicalRecord> records) {
        return records.stream().map(this::toResponse).collect(Collectors.toList());
    }
}