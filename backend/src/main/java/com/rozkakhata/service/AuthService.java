package com.rozkakhata.service;

import com.rozkakhata.dto.AuthResponse;
import com.rozkakhata.dto.LoginRequest;
import com.rozkakhata.dto.RegisterRequest;
import com.rozkakhata.dto.UserResponse;
import com.rozkakhata.entity.User;
import com.rozkakhata.exception.EmailAlreadyExistsException;
import com.rozkakhata.exception.InvalidCredentialsException;
import com.rozkakhata.repository.UserRepository;
import com.rozkakhata.security.JwtService;
import org.springframework.dao.DataIntegrityViolationException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.Locale;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    /** Used so that "unknown email" takes about as long as "wrong password". */
    private final String dummyHash;

    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder, JwtService jwtService) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.dummyHash = passwordEncoder.encode("not-a-real-password");
    }

    public UserResponse register(RegisterRequest req) {
        String email = normalize(req.email());

        if (userRepository.existsByEmail(email)) {
            throw new EmailAlreadyExistsException();
        }

        // Only the BCrypt hash is stored. The raw password is never saved.
        User user = new User(req.name().trim(), email, passwordEncoder.encode(req.password()));
        try {
            user = userRepository.saveAndFlush(user);
        } catch (DataIntegrityViolationException e) {
            // two people registered the same email at the same moment: the unique index caught it
            throw new EmailAlreadyExistsException();
        }
        return UserResponse.from(user);
    }

    public AuthResponse login(LoginRequest req) {
        String email = normalize(req.email());
        User user = userRepository.findByEmail(email).orElse(null);

        if (user == null) {
            passwordEncoder.matches(req.password(), dummyHash);
            throw new InvalidCredentialsException();
        }
        if (!passwordEncoder.matches(req.password(), user.getPassword())) {
            throw new InvalidCredentialsException();
        }
        return new AuthResponse(jwtService.generateToken(user), UserResponse.from(user));
    }

    private static String normalize(String email) {
        return email.trim().toLowerCase(Locale.ROOT);
    }
}
