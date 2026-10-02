package com.rozkakhata.security;

/** The logged-in user as known from the JWT. Controllers receive this via @AuthenticationPrincipal. */
public record AuthenticatedUser(Long id, String email) {
}
