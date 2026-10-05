package com.sliit.vbs.config;

import com.sliit.vbs.user.service.UserService;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.AuthenticationProvider;
import org.springframework.security.authentication.dao.DaoAuthenticationProvider;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.method.configuration.EnableMethodSecurity;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.annotation.web.configurers.HeadersConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsConfigurationSource;

/**
 * ============================================================================
 * VIVA EXPLANATION: SecurityConfig (Spring Security 6)
 * ----------------------------------------------------------------------------
 * Key architectural points:
 * 1. Stateless Authentication: SessionCreationPolicy.STATELESS ensures the server
 *    does not keep HTTP sessions, scaling horizontally effortlessly.
 * 2. BCryptPasswordEncoder: One-way hashing algorithm with salted rounds preventing
 *    rainbow table attacks.
 * 3. Role-Based Access Control (RBAC): Maps our 6 domain roles to specific
 *    subsystems while allowing guest browsing for shared video exploration.
 * ============================================================================
 */
@Configuration
@EnableWebSecurity
@EnableMethodSecurity
public class SecurityConfig {

    private final JwtFilter jwtFilter;
    private final UserService userService;
    private final CorsConfigurationSource corsConfigurationSource;

    public SecurityConfig(JwtFilter jwtFilter,
                          UserService userService,
                          CorsConfigurationSource corsConfigurationSource) {
        this.jwtFilter = jwtFilter;
        this.userService = userService;
        this.corsConfigurationSource = corsConfigurationSource;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationProvider authenticationProvider() {
        DaoAuthenticationProvider authProvider = new DaoAuthenticationProvider();
        authProvider.setUserDetailsService(userService);
        authProvider.setPasswordEncoder(passwordEncoder());
        return authProvider;
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(AbstractHttpConfigurer::disable)
                .cors(cors -> cors.configurationSource(corsConfigurationSource))
                .headers(headers -> headers.frameOptions(HeadersConfigurer.FrameOptionsConfig::disable)) // Allows H2 console if used
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .authenticationProvider(authenticationProvider())
                .addFilterBefore(jwtFilter, UsernamePasswordAuthenticationFilter.class)
                .exceptionHandling(ex -> ex
                        .authenticationEntryPoint((request, response, authException) -> {
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Unauthorized: Your session has expired or you are not signed in. Please log in.\",\"data\":null}");
                        })
                        .accessDeniedHandler((request, response, accessDeniedException) -> {
                            response.setStatus(HttpServletResponse.SC_FORBIDDEN);
                            response.setContentType("application/json");
                            response.getWriter().write("{\"success\":false,\"message\":\"Access Denied: You do not have permission for this resource.\",\"data\":null}");
                        })
                )
                .authorizeHttpRequests(auth -> auth
                        // Public Endpoints (Auth, Video Browsing, Swagger, Uploads, Public Comments)
                        .requestMatchers("/api/v1/auth/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/videos/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/categories/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/comments/video/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/api/v1/playlists/public").permitAll()
                        .requestMatchers("/swagger-ui/**", "/swagger-ui.html", "/v3/api-docs/**").permitAll()
                        .requestMatchers("/h2-console/**").permitAll()
                        .requestMatchers("/uploads/**").permitAll()

                        // Role 1: Content Creator Studio Management
                        .requestMatchers(HttpMethod.POST, "/api/v1/videos").hasAuthority("ROLE_CONTENT_CREATOR")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/videos/**").hasAuthority("ROLE_CONTENT_CREATOR")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/videos/**").hasAuthority("ROLE_CONTENT_CREATOR")
                        .requestMatchers("/api/v1/videos/creator/**").hasAuthority("ROLE_CONTENT_CREATOR")

                        // Role 2: Category Manager
                        .requestMatchers(HttpMethod.POST, "/api/v1/categories/**").hasAuthority("ROLE_CATEGORY_MANAGER")
                        .requestMatchers(HttpMethod.PUT, "/api/v1/categories/**").hasAuthority("ROLE_CATEGORY_MANAGER")
                        .requestMatchers(HttpMethod.DELETE, "/api/v1/categories/**").hasAuthority("ROLE_CATEGORY_MANAGER")

                        // Role 3: Playlist Manager Oversight
                        .requestMatchers("/api/v1/playlists/manage/**").hasAuthority("ROLE_PLAYLIST_MANAGER")

                        // Role 4: Favourite Manager Platform-wide Oversight & Analytics
                        .requestMatchers("/api/v1/favourites/management/**", "/api/v1/favourites/analytics/**").hasAuthority("ROLE_FAVOURITE_MANAGER")

                        // Role 5: Comment Manager Moderation (Pin, Unpin, Hide, Unhide)
                        .requestMatchers("/api/v1/comments/*/pin", "/api/v1/comments/*/unpin",
                                        "/api/v1/comments/*/hide", "/api/v1/comments/*/unhide").hasAuthority("ROLE_COMMENT_MANAGER")

                        // Role 6: Technical Supporter Ticket Resolution
                        .requestMatchers(HttpMethod.PUT, "/api/v1/support/tickets/*/status").hasAuthority("ROLE_TECHNICAL_SUPPORTER")
                        .requestMatchers(HttpMethod.GET, "/api/v1/support/stats").hasAuthority("ROLE_TECHNICAL_SUPPORTER")

                        // General Viewer & Authenticated Interactivity (Like, Favourite, Comment, Playlists, Support)
                        .requestMatchers(HttpMethod.POST, "/api/v1/videos/*/like").authenticated()
                        .requestMatchers("/api/v1/favourites/**").authenticated()
                        .requestMatchers("/api/v1/comments/**").authenticated()
                        .requestMatchers("/api/v1/playlists/**").authenticated()
                        .requestMatchers("/api/v1/support/**").authenticated()
                        .requestMatchers("/api/v1/notifications/**").authenticated()

                        // Any other request must be authenticated
                        .anyRequest().authenticated()
                );

        return http.build();
    }
}
