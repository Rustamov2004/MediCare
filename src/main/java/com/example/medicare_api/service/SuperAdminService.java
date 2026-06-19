package com.example.medicare_api.service;

import com.example.medicare_api.payload.request.UserRequest;
import com.example.medicare_api.payload.responce.UserResponse;

import java.util.List;

public interface SuperAdminService {
    UserResponse createAdmin(UserRequest request);
    UserResponse updateAdmin(Long id, UserRequest request);
    List<UserResponse> getAllAdmins();
    void deleteAdmin(Long id);
}
