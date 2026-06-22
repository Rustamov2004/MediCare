package com.example.medicare_api.repository;
import com.example.medicare_api.entity.SystemLog;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.data.jpa.repository.Modifying;
@Repository
public interface SystemLogRepository extends JpaRepository<SystemLog, Long> {
    List<SystemLog> findAllByAdminIdOrderByCreatedAtDesc(Long adminId);
    List<SystemLog> findAllByOrderByCreatedAtDesc();
    @Modifying
    @Transactional
    void deleteAllByAdminId(Long adminId);
}