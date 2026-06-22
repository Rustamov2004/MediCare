package com.example.medicare_api.payload.request;
import lombok.Data;
@Data
public class ProfileUpdateRequest {
    private String fullName;
    private String username;
    private String password;
    private String phone;
}