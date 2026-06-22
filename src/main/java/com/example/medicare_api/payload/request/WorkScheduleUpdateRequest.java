package com.example.medicare_api.payload.request;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;
@Data
@NoArgsConstructor
@AllArgsConstructor
public class WorkScheduleUpdateRequest {
    private List<String> workDates;
    private List<String> restDates;
}