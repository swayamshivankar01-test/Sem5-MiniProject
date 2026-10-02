package com.rozkakhata.exception;

/** Mapped to HTTP 409. */
public class EmailAlreadyExistsException extends RuntimeException {
    public EmailAlreadyExistsException() {
        super("Email already exists");
    }
}
