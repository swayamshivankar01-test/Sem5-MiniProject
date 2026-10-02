package com.rozkakhata.entity;

import jakarta.persistence.*;

/** A registered person. The table is called "users" because "user" is a reserved word in PostgreSQL. */
@Entity
@Table(name = "users")
public class User {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(nullable = false, length = 100)
    private String name;

    @Column(nullable = false, unique = true, length = 255)
    private String email;

    /** BCrypt hash of the password. The raw password is never stored. */
    @Column(nullable = false, length = 100)
    private String password;

    protected User() { } // required by JPA

    public User(String name, String email, String password) {
        this.name = name;
        this.email = email;
        this.password = password;
    }

    public Long getId() { return id; }
    public String getName() { return name; }
    public String getEmail() { return email; }
    public String getPassword() { return password; }
}
