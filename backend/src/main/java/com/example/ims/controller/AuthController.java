package com.example.ims.controller;

import com.example.ims.model.Role;
import com.example.ims.model.User;
import com.example.ims.security.JwtTokenProvider;
import com.example.ims.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.web.bind.annotation.*;

import java.util.Date;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private JwtTokenProvider tokenProvider;

    @Autowired
    private UserService userService;

    @Autowired
    private com.example.ims.security.TokenBlacklistService tokenBlacklistService;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    loginRequest.getUsername(),
                    loginRequest.getPassword()
                )
            );

            SecurityContextHolder.getContext().setAuthentication(authentication);
            Map<String, Object> tokenInfo = tokenProvider.generateTokenWithInfo(loginRequest.getUsername());

            // Get user information
            User user = userService.getUserByUsername(loginRequest.getUsername());

            Map<String, Object> response = new HashMap<>();
            response.put("token", tokenInfo.get("token"));
            response.put("user", user);
            response.put("message", "Login successful");
            response.put("type", "Bearer");
            response.put("expiresAt", tokenInfo.get("expiresAt"));
            response.put("issuedAt", tokenInfo.get("issuedAt"));
            response.put("expiresIn", tokenInfo.get("expiresIn"));

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Invalid username or password");
            errorResponse.put("message", "Authentication failed");
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/change-password")
    public ResponseEntity<?> changePassword(@RequestBody ChangePasswordRequest changePasswordRequest,
                                          @RequestHeader("Authorization") String authorizationHeader) {
        try {
            // Get current authenticated user
            Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
            String currentUsername = authentication.getName();

            // Change password
            userService.changePassword(
                currentUsername,
                changePasswordRequest.getCurrentPassword(),
                changePasswordRequest.getNewPassword()
            );

            // Blacklist the current token
            if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
                String token = authorizationHeader.substring(7);
                // Get token expiration time
                Date expirationDate = tokenProvider.getExpirationDateFromToken(token);
                tokenBlacklistService.blacklistToken(token, expirationDate.getTime());
            }

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Password changed successfully. Please login again with your new password.");
            response.put("logoutRequired", true);

            return ResponseEntity.ok(response);
        } catch (IllegalArgumentException e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Password change failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(400).body(errorResponse);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Password change failed");
            errorResponse.put("message", "An error occurred while changing password");
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid authorization header");
                errorResponse.put("message", "Bearer token is required");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authorizationHeader.substring(7);

            // Check if token is blacklisted
            if (tokenBlacklistService.isBlacklisted(token)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token validation failed");
                errorResponse.put("message", "Token has been invalidated due to password change");
                errorResponse.put("code", "TOKEN_BLACKLISTED");
                return ResponseEntity.status(401).body(errorResponse);
            }

            if (!tokenProvider.validateToken(token)) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Token validation failed");
                errorResponse.put("message", "Token is invalid or expired");
                errorResponse.put("code", "TOKEN_EXPIRED");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String username = tokenProvider.getUsernameFromToken(token);
            Date expirationDate = tokenProvider.getExpirationDateFromToken(token);

            // Get user information
            User user = userService.getUserByUsername(username);

            Map<String, Object> response = new HashMap<>();
            response.put("user", user);
            response.put("valid", true);
            response.put("username", username);
            response.put("expiresAt", expirationDate.getTime());
            response.put("message", "Token is valid");
            response.put("blacklistSize", tokenBlacklistService.getBlacklistSize());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Token validation failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(401).body(errorResponse);
        }
    }

    @PostMapping("/debug-token")
    public ResponseEntity<?> debugToken(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid authorization header");
                errorResponse.put("message", "Bearer token is required");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authorizationHeader.substring(7);

            Map<String, Object> response = new HashMap<>();
            response.put("tokenLength", token.length());
            response.put("isBlacklisted", tokenBlacklistService.isBlacklisted(token));
            response.put("blacklistSize", tokenBlacklistService.getBlacklistSize());
            response.put("isValid", tokenProvider.validateToken(token));

            if (tokenProvider.validateToken(token)) {
                response.put("username", tokenProvider.getUsernameFromToken(token));
                response.put("expirationDate", tokenProvider.getExpirationDateFromToken(token));
            }

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Debug failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    @PostMapping("/manual-blacklist")
    public ResponseEntity<?> manualBlacklist(@RequestHeader("Authorization") String authorizationHeader) {
        try {
            if (authorizationHeader == null || !authorizationHeader.startsWith("Bearer ")) {
                Map<String, Object> errorResponse = new HashMap<>();
                errorResponse.put("error", "Invalid authorization header");
                errorResponse.put("message", "Bearer token is required");
                return ResponseEntity.status(401).body(errorResponse);
            }

            String token = authorizationHeader.substring(7);
            Date expirationDate = tokenProvider.getExpirationDateFromToken(token);
            tokenBlacklistService.blacklistToken(token, expirationDate.getTime());

            Map<String, Object> response = new HashMap<>();
            response.put("message", "Token manually blacklisted");
            response.put("blacklistSize", tokenBlacklistService.getBlacklistSize());
            response.put("tokenLength", token.length());

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            Map<String, Object> errorResponse = new HashMap<>();
            errorResponse.put("error", "Manual blacklist failed");
            errorResponse.put("message", e.getMessage());
            return ResponseEntity.status(500).body(errorResponse);
        }
    }

    // Request/Response classes
    public static class LoginRequest {
        private String username;
        private String password;

        // Getters and setters
        public String getUsername() { return username; }
        public void setUsername(String username) { this.username = username; }
        public String getPassword() { return password; }
        public void setPassword(String password) { this.password = password; }
    }

    public static class ChangePasswordRequest {
        private String currentPassword;
        private String newPassword;

        // Getters and setters
        public String getCurrentPassword() { return currentPassword; }
        public void setCurrentPassword(String currentPassword) { this.currentPassword = currentPassword; }
        public String getNewPassword() { return newPassword; }
        public void setNewPassword(String newPassword) { this.newPassword = newPassword; }
    }
}
