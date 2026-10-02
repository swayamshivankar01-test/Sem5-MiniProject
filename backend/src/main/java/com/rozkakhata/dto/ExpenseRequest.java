package com.rozkakhata.dto;

import jakarta.validation.constraints.*;

import java.math.BigDecimal;
import java.time.LocalDate;

/** Body for POST and PUT. There is deliberately NO userId field: the owner always comes from the JWT. */
public record ExpenseRequest(
        @NotNull(message = "Amount is required")
        @DecimalMin(value = "0.00", inclusive = false, message = "Amount must be greater than 0")
        @Digits(integer = 10, fraction = 2, message = "Amount can have at most 2 decimal places")
        BigDecimal amount,

        @NotNull(message = "Date is required")
        LocalDate date,

        @NotBlank(message = "Category is required")
        @Pattern(regexp = "Food|Transport|Bills|Shopping|Health|Entertainment|Other",
                 message = "Invalid category")
        String category,

        @Size(max = 60, message = "Note can be at most 60 characters")
        String note) {
}
