package com.rozkakhata.repository;

import com.rozkakhata.entity.Expense;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

/** Every method takes the user id, so it is impossible to read another user's rows by accident. */
public interface ExpenseRepository extends JpaRepository<Expense, Long> {
    List<Expense> findByUserIdOrderByDateDescIdDesc(Long userId);
    Optional<Expense> findByIdAndUserId(Long id, Long userId);
}
