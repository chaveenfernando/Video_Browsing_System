package com.sliit.vbs.config;

import com.sliit.vbs.common.util.JwtUtil;
import com.sliit.vbs.user.service.UserService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.lang.NonNull;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

/**
 * ============================================================================
 * VIVA EXPLANATION: JwtFilter (OncePerRequestFilter)
 * ----------------------------------------------------------------------------
 * How it works:
 * 1. Intercepts incoming HTTP requests once.
 * 2. Checks the "Authorization" header for "Bearer <token>".
 * 3. Extracts and validates the JWT using JwtUtil.
 * 4. Loads UserDetails from the database/service.
 * 5. Populates Spring Security's SecurityContextHolder with an authenticated token.
 * 6. Downstream controllers can then inspect @AuthenticationPrincipal User user.
 *
 * NOTE: If the token references a user that no longer exists in the database
 * (e.g., H2 in-memory DB was restarted and an ad-hoc registered user is gone),
 * we catch UsernameNotFoundException and continue without setting authentication,
 * which causes the request to be treated as anonymous.
 * ============================================================================
 */
@Component
public class JwtFilter extends OncePerRequestFilter {

    private final JwtUtil jwtUtil;
    private final UserService userService;

    public JwtFilter(JwtUtil jwtUtil, UserService userService) {
        this.jwtUtil = jwtUtil;
        this.userService = userService;
    }

    @Override
    protected void doFilterInternal(@NonNull HttpServletRequest request,
                                    @NonNull HttpServletResponse response,
                                    @NonNull FilterChain filterChain) throws ServletException, IOException {

        final String authHeader = request.getHeader("Authorization");
        final String jwtToken;
        final String username;

        if (authHeader == null || !authHeader.startsWith("Bearer ")) {
            filterChain.doFilter(request, response);
            return;
        }

        jwtToken = authHeader.substring(7);
        try {
            username = jwtUtil.extractUsername(jwtToken);
        } catch (Exception e) {
            // Invalid/expired/malformed token — continue without setting authentication
            filterChain.doFilter(request, response);
            return;
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            try {
                UserDetails userDetails = userService.loadUserByUsername(username);

                if (jwtUtil.validateToken(jwtToken, userDetails.getUsername())) {
                    UsernamePasswordAuthenticationToken authToken =
                            new UsernamePasswordAuthenticationToken(userDetails, null, userDetails.getAuthorities());
                    authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            } catch (Exception ex) {
                // User referenced in token no longer exists (e.g., DB was wiped and user was not re-seeded).
                // Clear any partial state and continue — the request will be treated as unauthenticated.
                SecurityContextHolder.clearContext();
            }
        }

        filterChain.doFilter(request, response);
    }
}
