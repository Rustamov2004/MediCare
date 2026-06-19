package com.example.medicare_api.payload.responce;

import com.example.medicare_api.entity.CashShift;
import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;

@Data
@Builder
public class ShiftResponse {
    private Long id;
    private LocalDateTime openedAt;
    private LocalDateTime closedAt;
    private Double expectedCash;
    private Double actualCash;
    private Double cardAmount; // expected card
    private Double actualCard;
    private Double differenceAmount;
    private String status;
    private String comment;
    private String closedByFullName;

    public static ShiftResponse fromEntity(CashShift shift) {
        return ShiftResponse.builder()
                .id(shift.getId())
                .openedAt(shift.getOpenedAt())
                .closedAt(shift.getClosedAt())
                .expectedCash(shift.getExpectedCash())
                .actualCash(shift.getActualCash())
                .cardAmount(shift.getCardAmount())
                .actualCard(shift.getActualCard())
                .differenceAmount(shift.getDifferenceAmount())
                .status(shift.getStatus() != null ? shift.getStatus().name() : null)
                .comment(shift.getComment())
                .closedByFullName(shift.getClosedBy() != null ? shift.getClosedBy().getFullName() : null)
                .build();
    }
}
