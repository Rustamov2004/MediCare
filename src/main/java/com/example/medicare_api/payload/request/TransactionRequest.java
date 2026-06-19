package com.example.medicare_api.payload.request;

import com.example.medicare_api.enums.TransactionType;
import lombok.Data;

@Data
public class TransactionRequest {
    private Long userId;
    private Double amount;
    private TransactionType type;
    private String description;
}
