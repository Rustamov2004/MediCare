package com.example.medicare_api.repository;
import com.example.medicare_api.entity.CashShift;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.Optional;
@Repository
public interface CashShiftRepository extends JpaRepository<CashShift, Long> {
    Optional<CashShift> findFirstByStatusOrderByOpenedAtDesc(CashShift.ShiftStatus status);
}