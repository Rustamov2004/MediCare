package com.example.medicare_api.repository;
import com.example.medicare_api.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface UserRepository extends JpaRepository<User,Long> {
    Optional<User> findByUsername(String username);
    List<User> findAllByRole(com.example.medicare_api.enums.Role role);
    boolean existsByUsername(String username);
    List<User> findAllByRoleAndAdminId(com.example.medicare_api.enums.Role role, Long adminId);
    List<User> findAllByAdminId(Long adminId);
    boolean existsByRole(com.example.medicare_api.enums.Role role);
    boolean existsByUsernameAndIdNot(String username, Long id);
    List<User> findAllByActiveTrue();
    List<User> findAllByAdminIdAndActiveTrue(Long adminId);
}