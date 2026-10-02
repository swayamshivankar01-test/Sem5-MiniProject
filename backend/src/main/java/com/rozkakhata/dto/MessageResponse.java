package com.rozkakhata.dto;

/** Simple {"message": "..."} body for successful actions such as delete. */
public record MessageResponse(String message) {
}
