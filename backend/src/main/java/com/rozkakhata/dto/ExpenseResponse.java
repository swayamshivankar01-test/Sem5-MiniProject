package com.rozkakhata.dto;

import com.rozkakhata.entity.Expense;

import java.math.BigDecimal;
import java.time.LocalDate;

public record ExpenseResponse(Long id, BigDecimal amount, LocalDate date, String category, String note) {
    public static ExpenseResponse from(Expense e) {
        return new ExpenseResponse(e.getId(), e.getAmount(), e.getDate(), e.getCategory(), e.getNote());
    }
}
