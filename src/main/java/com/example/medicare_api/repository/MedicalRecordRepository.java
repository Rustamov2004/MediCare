package com.example.medicare_api.repository;

import com.example.medicare_api.entity.MedicalRecord;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface MedicalRecordRepository extends JpaRepository<MedicalRecord,Long> {
    // Bemorning barcha kasallik tarixini olish
    List<MedicalRecord> findAllByVisit_Patient_Id(Long patientId);

    // Konkret bir qabul (visit) bo'yicha tashxisni topish
    Optional<MedicalRecord> findByVisitId(Long visitId);

    List<MedicalRecord> findAllByAdminId(Long adminId);
}
