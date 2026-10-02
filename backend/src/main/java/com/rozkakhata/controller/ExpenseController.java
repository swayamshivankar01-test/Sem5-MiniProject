package com.rozkakhata.controller;

import com.rozkakhata.dto.ExpenseRequest;
import com.rozkakhata.dto.ExpenseResponse;
import com.rozkakhata.dto.MessageResponse;
import com.rozkakhata.security.AuthenticatedUser;
import com.rozkakhata.service.ExpenseService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

/** The user is ALWAYS taken from the JWT (@AuthenticationPrincipal), never from the request body or URL. */
@RestController
@RequestMapping("/api/expenses")
public class ExpenseController {

    private final ExpenseService expenseService;

    public ExpenseController(ExpenseService expenseService) {
        this.expenseService = expenseService;
    }

    @GetMapping
    public List<ExpenseResponse> list(@AuthenticationPrincipal AuthenticatedUser me) {
        return expenseService.list(me.id());
    }

    @PostMapping
    @ResponseStatus(HttpStatus.CREATED)
    public ExpenseResponse create(@AuthenticationPrincipal AuthenticatedUser me,
                                  @Valid @RequestBody ExpenseRequest request) {
        return expenseService.create(me.id(), request);
    }

    @PutMapping("/{id}")
    public ExpenseResponse update(@AuthenticationPrincipal AuthenticatedUser me,
                                  @PathVariable Long id,
                                  @Valid @RequestBody ExpenseRequest request) {
        return expenseService.update(me.id(), id, request);
    }

    @DeleteMapping("/{id}")
    public MessageResponse delete(@AuthenticationPrincipal AuthenticatedUser me, @PathVariable Long id) {
        expenseService.delete(me.id(), id);
        return new MessageResponse("Expense deleted");
    }
}
