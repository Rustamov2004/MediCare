package com.example.medicare_api.service;
import com.example.medicare_api.payload.request.ProfileUpdateRequest;
import com.example.medicare_api.payload.responce.UserResponse;
public interface ProfileService {
    UserResponse getMyProfile();
    UserResponse updateMyProfile(ProfileUpdateRequest request);
}