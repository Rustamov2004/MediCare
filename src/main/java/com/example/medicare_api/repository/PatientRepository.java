package com.example.medicare_api.repository;
import com.example.medicare_api.entity.Patient;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import java.util.List;
import java.util.Optional;
public interface PatientRepository extends JpaRepository<Patient,Long> {
    Optional<Patient> findByPhone(String phone);
    List<Patient> findAllByAdminId(Long adminId);
    @Query("SELECT p FROM Patient p WHERE p.adminId = :adminId AND " +
           "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR p.phone LIKE CONCAT('%', :q, '%'))")
    List<Patient> searchByNameOrPhone(@Param("adminId") Long adminId, @Param("q") String q);
    @Query("SELECT p FROM Patient p WHERE " +
           "(LOWER(p.fullName) LIKE LOWER(CONCAT('%', :q, '%')) OR p.phone LIKE CONCAT('%', :q, '%'))")
    List<Patient> searchByNameOrPhoneNoAdmin(@Param("q") String q);
}