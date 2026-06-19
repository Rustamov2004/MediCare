package com.example.medicare_api.enums;

public enum VisitStatus {
    WAITING,      // Navbatda turibdi
    IN_PROCESS,   // Shifokor ko'rigida yoki muolajada
    COMPLETED,    // Yakunlandi
    REJECTED,     // Rad etilgan
    UNPAID        // To'lovi qilinmagan muolaja
}
