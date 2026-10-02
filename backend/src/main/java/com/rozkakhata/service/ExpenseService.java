package com.rozkakhata.service;

import com.rozkakhata.dto.ExpenseRequest;
import com.rozkakhata.dto.ExpenseResponse;
import com.rozkakhata.entity.Expense;
import com.rozkakhata.entity.User;
import com.rozkakhata.exception.ResourceNotFoundException;
import com.rozkakhata.repository.ExpenseRepository;
import com.rozkakhata.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

/**
 * All methods receive the userId of the LOGGED-IN user (taken from the JWT by the controller).
 * Every database lookup includes that userId, so one user can never touch another user's expenses.
 */
@Service
public class ExpenseService {

    private final ExpenseRepository expenseRepository;
    private final UserRepository userRepository;

    public ExpenseService(ExpenseRepository expenseRepository, UserRepository userRepository) {
        this.expenseRepository = expenseRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ExpenseResponse> list(Long userId) {
        return expenseRepository.findByUserIdOrderByDateDescIdDesc(userId)
                .stream().map(ExpenseResponse::from).toList();
    }

    @Transactional
    public ExpenseResponse create(Long userId, ExpenseRequest req) {
        User owner = userRepository.getReferenceById(userId);
        Expense expense = new Expense(req.amount(), req.date(), req.category(), cleanNote(req.note()), owner);
        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public ExpenseResponse update(Long userId, Long expenseId, ExpenseRequest req) {
        Expense expense = findOwned(userId, expenseId);
        expense.setAmount(req.amount());
        expense.setDate(req.date());
        expense.setCategory(req.category());
        expense.setNote(cleanNote(req.note()));
        return ExpenseResponse.from(expenseRepository.save(expense));
    }

    @Transactional
    public void delete(Long userId, Long expenseId) {
        expenseRepository.delete(findOwned(userId, expenseId));
    }

    /** 404 both when the id does not exist and when it belongs to someone else (so ids cannot be probed). */
    private Expense findOwned(Long userId, Long expenseId) {
        return expenseRepository.findByIdAndUserId(expenseId, userId)
                .orElseThrow(() -> new ResourceNotFoundException("Expense not found"));
    }

    private static String cleanNote(String note) {
        return note == null ? "" : note.trim();
    }
}
