package com.rozkakhata.entity;

import jakarta.persistence.*;
import java.math.BigDecimal;
import java.time.LocalDate;

/** One expense. Every expense belongs to exactly one user (user_id column). */
@Entity
@Table(name = "expenses", indexes = @Index(name = "idx_expenses_user_id", columnList = "user_id"))
public class Expense {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, precision = 12, scale = 2)
    private BigDecimal amount;

    @Column(nullable = false)
    private LocalDate date;

    @Column(nullable = false, length = 50)
    private String category;

    @Column(length = 60)
    private String note;

    @ManyToOne(fetch = FetchType.LAZY, optional = false)
    @JoinColumn(name = "user_id", nullable = false)
    private User user;

    protected Expense() { } // required by JPA

    public Expense(BigDecimal amount, LocalDate date, String category, String note, User user) {
        this.amount = amount;
        this.date = date;
        this.category = category;
        this.note = note;
        this.user = user;
    }

    public Long getId() { return id; }
    public BigDecimal getAmount() { return amount; }
    public LocalDate getDate() { return date; }
    public String getCategory() { return category; }
    public String getNote() { return note; }
    public User getUser() { return user; }

    public void setAmount(BigDecimal amount) { this.amount = amount; }
    public void setDate(LocalDate date) { this.date = date; }
    public void setCategory(String category) { this.category = category; }
    public void setNote(String note) { this.note = note; }
}
