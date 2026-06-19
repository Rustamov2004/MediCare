package com.example.medicare_api.utils;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;

@Data
public class DateUtils {
    public static LocalDateTime startOfDay(LocalDate date) {
        return date.atStartOfDay();
    }
    public static LocalDateTime endOfDay(LocalDate date) {
        return date.atTime(LocalTime.MAX);
    }
}
