package com.example.medicare_api.controller;
import com.example.medicare_api.payload.request.ProfileUpdateRequest;
import com.example.medicare_api.payload.responce.UserResponse;
import com.example.medicare_api.service.ProfileService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
@RestController
@RequestMapping("/api/profile")
@RequiredArgsConstructor
@CrossOrigin(origins = "http://localhost:5173")
public class ProfileController {
    private final ProfileService profileService;
    @GetMapping("/me")
    public ResponseEntity<UserResponse> getMyProfile() {
        return ResponseEntity.ok(profileService.getMyProfile());
    }
    @PutMapping("/update")
    public ResponseEntity<UserResponse> updateMyProfile(@RequestBody ProfileUpdateRequest request) {
        return ResponseEntity.ok(profileService.updateMyProfile(request));
    }
}