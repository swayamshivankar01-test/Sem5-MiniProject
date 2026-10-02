package com.rozkakhata.exception;

/** Mapped to HTTP 404. Also used when an expense exists but belongs to someone else. */
public class ResourceNotFoundException extends RuntimeException {
    public ResourceNotFoundException(String message) {
        super(message);
    }
}
