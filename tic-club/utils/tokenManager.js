const jwt = require('jsonwebtoken');
require('dotenv').config();

// Token management utility
class TokenManager {
    constructor() {
        this.invalidatedTokens = new Map(); // Map to store token:expirationTime pairs
        this.cleanupInterval = setInterval(() => this.cleanupInvalidatedTokens(), 3600000); // Cleanup every hour
    }

    // Add a token to the invalidated set with its expiration time
    invalidateToken(token) {
        try {
            const decoded = jwt.decode(token);
            if (decoded && decoded.exp) {
                this.invalidatedTokens.set(token, decoded.exp * 1000); // Convert to milliseconds
            } else {
                // If no expiration, invalidate for 24 hours
                this.invalidatedTokens.set(token, Date.now() + 86400000);
            }
        } catch (error) {
            console.error('Error invalidating token:', error);
            // Default invalidation for 24 hours if token can't be decoded
            this.invalidatedTokens.set(token, Date.now() + 86400000);
        }
    }

    // Check if a token is invalidated
    isTokenInvalidated(token) {
        return this.invalidatedTokens.has(token);
    }

    // Clean up expired invalidated tokens
    cleanupInvalidatedTokens() {
        const now = Date.now();
        for (const [token, expTime] of this.invalidatedTokens.entries()) {
            if (now >= expTime) {
                this.invalidatedTokens.delete(token);
            }
        }
    }

    // Generate new tokens
    generateTokens(username) {
        const accessToken = jwt.sign(
            { username },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { username },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        return { accessToken, refreshToken };
    }

    // Refresh access token
    async refreshAccessToken(refreshToken) {
        try {
            // Verify refresh token
            const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

            // Check if refresh token is invalidated
            if (this.isTokenInvalidated(refreshToken)) {
                throw new Error('Refresh token has been invalidated');
            }

            // Generate new access token
            const accessToken = jwt.sign(
                { username: decoded.username },
                process.env.JWT_SECRET,
                { expiresIn: '1h' }
            );

            return accessToken;
        } catch (error) {
            throw new Error('Invalid refresh token');
        }
    }

    // Stop the cleanup interval when the application shuts down
    stopCleanup() {
        if (this.cleanupInterval) {
            clearInterval(this.cleanupInterval);
        }
    }
}

// Export a singleton instance
module.exports = new TokenManager();
