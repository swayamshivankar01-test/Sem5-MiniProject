package com.rozkakhata.security;

import com.rozkakhata.repository.UserRepository;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.List;

/**
 * Runs on every request:
 *  1. read "Authorization: Bearer <token>"
 *  2. validate the token (signature + expiry)
 *  3. confirm the user still exists
 *  4. put the user into the Spring Security context
 * If anything is wrong we simply do not authenticate, and Spring Security answers 401 for protected URLs.
 *
 * NOTE: this class is NOT a @Component on purpose. It is created inside SecurityConfig so Spring Boot
 * does not also register it as a plain servlet filter.
 */
public class JwtAuthFilter extends OncePerRequestFilter {

    private final JwtService jwtService;
    private final UserRepository userRepository;

    public JwtAuthFilter(JwtService jwtService, UserRepository userRepository) {
        this.jwtService = jwtService;
        this.userRepository = userRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response,
                                    FilterChain chain) throws ServletException, IOException {
        String header = request.getHeader("Authorization");

        if (header != null && header.startsWith("Bearer ")) {
            String token = header.substring(7).trim();
            try {
                Claims claims = jwtService.parse(token);
                userRepository.findByEmail(claims.getSubject()).ifPresent(user -> {
                    AuthenticatedUser principal = new AuthenticatedUser(user.getId(), user.getEmail());
                    UsernamePasswordAuthenticationToken auth = new UsernamePasswordAuthenticationToken(
                            principal, null, List.of(new SimpleGrantedAuthority("ROLE_USER")));
                    auth.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(auth);
                });
            } catch (JwtException | IllegalArgumentException e) {
                // invalid, tampered or expired token -> stay unauthenticated
                SecurityContextHolder.clearContext();
            }
        }
        chain.doFilter(request, response);
    }
}
