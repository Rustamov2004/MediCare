package com.example.medicare_api.payload.responce;

import lombok.*;
import java.time.LocalDateTime;

@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class SystemLogResponse {
    private Long id;
    private Long performedById;
    private String performedByName;
    private String performedByRole;
    private String actionType;
    private String description;
    private String details;
    private LocalDateTime createdAt;
}
