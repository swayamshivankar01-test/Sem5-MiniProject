package com.rozkakhata.dto;

/** Every error is returned as {"message": "..."} */
public record ErrorResponse(String message) {
}
