package com.example.medicare_api.repository;

import com.example.medicare_api.entity.MedicalService;
import com.example.medicare_api.enums.ServiceType;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MedicalServiceRepository extends JpaRepository<MedicalService,Long> {
    // Faqat ko'riklar yoki faqat muolajalarni olish uchun
    List<MedicalService> findAllByType(ServiceType type);

    // Doctor tanlanganda uning mutaxassisligiga mos CHECKUP xizmatlarini topish uchun
    List<MedicalService> findAllByTypeAndSpecialization(ServiceType type, String specialization);

    List<MedicalService> findAllByTypeAndDoctorId(ServiceType type, Long doctorId);

    List<MedicalService> findAllByAdminId(Long adminId);
    List<MedicalService> findAllByAdminIdAndType(Long adminId, ServiceType type);
    List<MedicalService> findAllByAdminIdAndTypeAndSpecialization(Long adminId, ServiceType type, String specialization);
    boolean existsByAdminIdAndDoctorId(Long adminId, Long doctorId);
}
