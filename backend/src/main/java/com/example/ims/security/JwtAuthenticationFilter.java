package com.example.ims.security;

import com.fasterxml.jackson.databind.ObjectMapper;
import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.JwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.util.StringUtils;
import org.springframework.web.filter.OncePerRequestFilter;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;

import java.io.IOException;
import java.util.HashMap;
import java.util.Map;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private static final Logger logger = LoggerFactory.getLogger(JwtAuthenticationFilter.class);

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserDetailsService userDetailsService;

    @Autowired
    private TokenBlacklistService tokenBlacklistService;

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {
        try {
            String jwt = getJwtFromRequest(request);

            if (StringUtils.hasText(jwt)) {
                // Debug logging
                logger.info("Processing JWT token for request: " + request.getRequestURI());
                logger.info("Token length: " + jwt.length());
                logger.info("Is blacklisted: " + tokenBlacklistService.isBlacklisted(jwt));
                logger.info("Blacklist size: " + tokenBlacklistService.getBlacklistSize());

                // Check if token is blacklisted
                if (tokenBlacklistService.isBlacklisted(jwt)) {
                    logger.warn("Token is blacklisted - rejecting request");
                    handleTokenError(response, "Token has been invalidated due to password change. Please login again.", 401);
                    return;
                }

                if (tokenProvider.validateToken(jwt)) {
                    String username = tokenProvider.getUsernameFromToken(jwt);
                    logger.info("Token validated for user: " + username);
                    UserDetails userDetails = userDetailsService.loadUserByUsername(username);
                    UsernamePasswordAuthenticationToken authentication = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    authentication.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));

                    SecurityContextHolder.getContext().setAuthentication(authentication);
                    logger.info("Authentication set for user: " + username + " with authorities: " + userDetails.getAuthorities());

                    // Additional debug for purchase orders
                    if (request.getRequestURI().contains("/purchase-orders")) {
                        logger.info("Purchase order request - User authorities: " + userDetails.getAuthorities());
                        logger.info("Has ADMIN role: " + userDetails.getAuthorities().stream()
                            .anyMatch(auth -> auth.getAuthority().equals("ROLE_ADMIN")));
                    }
                } else {
                    // Token is invalid or expired
                    logger.warn("Token validation failed");
                    handleTokenError(response, "Token is invalid or expired", 401);
                    return;
                }
            } else {
                logger.info("No JWT token found in request: " + request.getRequestURI());
            }
        } catch (ExpiredJwtException e) {
            // Token has expired
            handleTokenError(response, "Token has expired. Please login again.", 401);
            return;
        } catch (JwtException e) {
            // Invalid JWT token
            handleTokenError(response, "Invalid token format", 401);
            return;
        } catch (Exception ex) {
            logger.error("Could not set user authentication in security context", ex);
            handleTokenError(response, "Authentication failed", 500);
            return;
        }

        filterChain.doFilter(request, response);
    }

    private void handleTokenError(HttpServletResponse response, String message, int status) throws IOException {
        response.setStatus(status);
        response.setContentType(MediaType.APPLICATION_JSON_VALUE);

        Map<String, Object> errorResponse = new HashMap<>();
        errorResponse.put("error", "Authentication failed");
        errorResponse.put("message", message);
        errorResponse.put("status", status);

        if (status == 401) {
            errorResponse.put("code", "TOKEN_EXPIRED");
        }

        ObjectMapper mapper = new ObjectMapper();
        mapper.writeValue(response.getOutputStream(), errorResponse);
    }

    private String getJwtFromRequest(HttpServletRequest request) {
        String bearerToken = request.getHeader("Authorization");
        if (StringUtils.hasText(bearerToken) && bearerToken.startsWith("Bearer ")) {
            return bearerToken.substring(7);
        }
        return null;
    }

    @Override
    protected boolean shouldNotFilter(HttpServletRequest request) throws ServletException {
        // Skip filter for authentication endpoints
        String path = request.getServletPath();
        String fullPath = request.getRequestURI();
        logger.info("Checking if should filter path: " + path + ", full URI: " + fullPath);
        
        // Check multiple possible patterns for auth endpoints
        boolean shouldSkip = path.startsWith("/auth/") || 
                           path.startsWith("/public/") ||
                           fullPath.contains("/auth/") ||
                           fullPath.contains("/public/");
        
        if (shouldSkip) {
            logger.info("Skipping JWT filter for path: " + path);
        } else {
            logger.info("Will apply JWT filter for path: " + path);
        }
        return shouldSkip;
    }
}
