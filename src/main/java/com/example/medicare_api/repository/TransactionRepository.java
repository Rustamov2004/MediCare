package com.example.medicare_api.repository;

import com.example.medicare_api.entity.Transaction;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface TransactionRepository extends JpaRepository<Transaction, Long> {
    List<Transaction> findAllByAdminIdAndUserId(Long adminId, Long userId);
    List<Transaction> findAllByAdminId(Long adminId);
}
