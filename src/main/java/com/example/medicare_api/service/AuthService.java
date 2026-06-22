package com.example.medicare_api.service;
import com.example.medicare_api.payload.request.LoginRequest;
import com.example.medicare_api.payload.responce.JwtResponse;
public interface AuthService {
    JwtResponse login(LoginRequest loginRequest);
}