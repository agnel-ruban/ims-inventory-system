package com.example.ims.security;

import org.springframework.stereotype.Service;
import java.util.concurrent.ConcurrentHashMap;
import java.util.Set;

@Service
public class TokenBlacklistService {
    
    private final ConcurrentHashMap<String, Long> blacklistedTokens = new ConcurrentHashMap<>();
    
    /**
     * Add a token to the blacklist
     * @param token The JWT token to blacklist
     * @param expirationTime The expiration time of the token
     */
    public void blacklistToken(String token, Long expirationTime) {
        blacklistedTokens.put(token, expirationTime);
    }
    
    /**
     * Check if a token is blacklisted
     * @param token The JWT token to check
     * @return true if the token is blacklisted, false otherwise
     */
    public boolean isBlacklisted(String token) {
        Long expirationTime = blacklistedTokens.get(token);
        if (expirationTime == null) {
            return false;
        }
        
        // Remove expired tokens from blacklist
        if (System.currentTimeMillis() > expirationTime) {
            blacklistedTokens.remove(token);
            return false;
        }
        
        return true;
    }
    
    /**
     * Clean up expired tokens from blacklist
     */
    public void cleanupExpiredTokens() {
        long currentTime = System.currentTimeMillis();
        blacklistedTokens.entrySet().removeIf(entry -> entry.getValue() < currentTime);
    }
    
    /**
     * Get the size of the blacklist (for monitoring)
     * @return Number of blacklisted tokens
     */
    public int getBlacklistSize() {
        cleanupExpiredTokens();
        return blacklistedTokens.size();
    }
} 