package com.example.medicare_api.payload.responce;

import com.example.medicare_api.enums.TransactionType;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class TransactionResponse {
    private Long id;
    private Long userId;
    private Double amount;
    private TransactionType type;
    private String description;
    private LocalDateTime createdAt;
}
