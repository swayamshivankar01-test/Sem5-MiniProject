package com.rozkakhata.dto;

import com.rozkakhata.entity.User;

/** Public user information. Never contains the password or hash. */
public record UserResponse(Long id, String name, String email) {
    public static UserResponse from(User u) {
        return new UserResponse(u.getId(), u.getName(), u.getEmail());
    }
}
