package com.example.medicare_api.repository;
import com.example.medicare_api.entity.Visit;
import com.example.medicare_api.enums.VisitStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.time.LocalDateTime;
import java.util.List;
public interface VisitRepository extends JpaRepository<Visit, Long> {
    @Query("SELECT v FROM Visit v WHERE v.status = 'WAITING' AND " +
            "(v.service.type = 'PROCEDURE' OR " +
            "EXISTS (SELECT m FROM MedicalRecord m WHERE m.visit = v AND m.needsProcedure = true)) " +
            "ORDER BY v.createdAt ASC") 
    List<Visit> findActiveQueue();
    List<Visit> findAllByCreatedAtBetween(LocalDateTime start, LocalDateTime end);
    @Query("SELECT v FROM Visit v WHERE LOWER(v.patient.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Visit> searchByPatientName(@Param("name") String name);
    List<Visit> findAllByStatus(VisitStatus status);
    List<Visit> findAllByStatusAndCreatedAtBetween(VisitStatus status, LocalDateTime start, LocalDateTime end);
    List<Visit> findAllByDoctorIdAndStatus(Long doctorId, VisitStatus status);
    List<Visit> findAllByDoctorIdAndStatusAndService_Type(Long doctorId, VisitStatus status, com.example.medicare_api.enums.ServiceType type);
    List<Visit> findAllByDoctorIdAndDiagnosisIsNotNullAndCreatedAtBetween(Long doctorId, LocalDateTime start, LocalDateTime end);
    List<Visit> findAllByDoctorIdAndDiagnosisIsNotNullOrderByCreatedAtDesc(Long doctorId);
    List<Visit> findAllByAdminId(Long adminId);
    @Query("SELECT v FROM Visit v WHERE v.status IN ('COMPLETED', 'REJECTED') AND " +
            "(v.service.type = 'PROCEDURE' OR " +
            "EXISTS (SELECT m FROM MedicalRecord m WHERE m.visit = v AND m.needsProcedure = true)) " +
            "ORDER BY v.createdAt DESC")
    List<Visit> findProcedureHistory();
    @Query("SELECT v FROM Visit v WHERE v.status IN ('COMPLETED', 'REJECTED') AND v.adminId = :adminId AND " +
            "(v.service.type = 'PROCEDURE' OR " +
            "EXISTS (SELECT m FROM MedicalRecord m WHERE m.visit = v AND m.needsProcedure = true)) " +
            "ORDER BY v.createdAt DESC")
    List<Visit> findProcedureHistoryByAdminId(@Param("adminId") Long adminId);
    @Query("SELECT v FROM Visit v WHERE v.status = 'WAITING' AND v.adminId = :adminId AND " +
            "(v.service.type = 'PROCEDURE' OR " +
            "EXISTS (SELECT m FROM MedicalRecord m WHERE m.visit = v AND m.needsProcedure = true)) " +
            "ORDER BY v.createdAt ASC")
    List<Visit> findActiveQueueByAdminId(@Param("adminId") Long adminId);
    List<Visit> findAllByAdminIdAndCreatedAtBetween(Long adminId, LocalDateTime start, LocalDateTime end);
    List<Visit> findAllByAdminIdAndStatusAndCreatedAtBetween(Long adminId, VisitStatus status, LocalDateTime start, LocalDateTime end);
    @Query("SELECT v FROM Visit v WHERE v.adminId = :adminId AND LOWER(v.patient.fullName) LIKE LOWER(CONCAT('%', :name, '%'))")
    List<Visit> searchByPatientNameAndAdminId(@Param("adminId") Long adminId, @Param("name") String name);
    List<Visit> findAllByAdminIdAndStatus(Long adminId, VisitStatus status);
    List<Visit> findAllByPatient_IdAndStatusOrderByCreatedAtDesc(Long patientId, VisitStatus status);
    long countByDoctorIdAndStatus(Long doctorId, VisitStatus status);
    @Query("SELECT v FROM Visit v WHERE v.doctor.id = :doctorId AND v.status = 'COMPLETED' AND v.createdAt BETWEEN :start AND :end")
    List<Visit> findByDoctorIdAndCompletedToday(@Param("doctorId") Long doctorId,
                                                 @Param("start") java.time.LocalDateTime start,
                                                 @Param("end") java.time.LocalDateTime end);
}