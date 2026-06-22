package com.example.medicare_api.controller;
import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.service.SuperAdminService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import java.util.List;
@RestController
@RequestMapping("/api/super-admin")
@RequiredArgsConstructor
public class SuperAdminController {
    private final SuperAdminService superAdminService;
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PostMapping("/admins")
    public ResponseEntity<UserResponse> createAdmin(@RequestBody UserRequest request) {
        return ResponseEntity.ok(superAdminService.createAdmin(request));
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @PutMapping("/admins/{id}")
    public ResponseEntity<UserResponse> updateAdmin(@PathVariable Long id, @RequestBody UserRequest request) {
        return ResponseEntity.ok(superAdminService.updateAdmin(id, request));
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @GetMapping("/admins")
    public ResponseEntity<List<UserResponse>> getAllAdmins() {
        return ResponseEntity.ok(superAdminService.getAllAdmins());
    }
    @PreAuthorize("hasRole('SUPER_ADMIN')")
    @DeleteMapping("/admins/{id}")
    public ResponseEntity<Void> deleteAdmin(@PathVariable Long id) {
        superAdminService.deleteAdmin(id);
        return ResponseEntity.noContent().build();
    }
}