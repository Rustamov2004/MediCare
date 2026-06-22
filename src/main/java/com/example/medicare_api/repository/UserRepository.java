package com.example.medicare_api.repository;

import com.example.medicare_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import javax.management.relation.Role;
import java.util.List;
import java.util.Optional;

public interface UserRepository extends JpaRepository<User,Long> {
    // Login qilish uchun kerak
    Optional<User> findByUsername(String username);

    // Rollar bo'yicha filtrlash (masalan, hamma shifokorlarni chiqarish)
    List<User> findAllByRole(Role role);

    // Username band yoki yo'qligini tekshirish
    boolean existsByUsername(String username);

    List<User> findAllByRole(com.example.medicare_api.enums.Role role);
    List<User> findAllByRoleAndAdminId(com.example.medicare_api.enums.Role role, Long adminId);
    
    List<User> findAllByAdminId(Long adminId);
    
    boolean existsByRole(com.example.medicare_api.enums.Role role);
    
    // Profilda login takrorlanishini oldini olish uchun
    boolean existsByUsernameAndIdNot(String username, Long id);

    List<User> findAllByActiveTrue();
    List<User> findAllByAdminIdAndActiveTrue(Long adminId);
}
