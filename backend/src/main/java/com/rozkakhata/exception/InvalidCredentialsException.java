package com.rozkakhata.exception;

/** Mapped to HTTP 401. The message is the same for "unknown email" and "wrong password" on purpose. */
public class InvalidCredentialsException extends RuntimeException {
    public InvalidCredentialsException() {
        super("Invalid email or password");
    }
}
