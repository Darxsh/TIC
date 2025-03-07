const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const auth = async (req, res, next) => {
    try {
        // Check for token in cookies first (preferred method)
        let token = req.cookies.accessToken;
        
        // Fallback to Authorization header if no cookie
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: {
                    code: 'NO_TOKEN',
                    message: 'No token, authorization denied'
                }
            });
        }

        // Verify token
        let decoded;
        try {
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token validation error:', error);
            const errorResponse = error.name === 'TokenExpiredError' ? {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired'
            } : error.name === 'JsonWebTokenError' ? {
                code: 'MALFORMED_TOKEN',
                message: 'Malformed authentication token'
            } : {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            };
            
            return res.status(401).json({ error: errorResponse });
        }
        
        // Check if admin exists
        const user = await User.findOne({ username: decoded.username, isAdmin: true });
        if (!user) {
            return res.status(401).json({
                error: {
                    code: 'INVALID_TOKEN',
                    message: 'Invalid token - user not found'
                }
            });
        }
        
        // Check token expiration
        if (decoded.exp && Date.now() >= decoded.exp * 1000) {
            // Try to refresh the token if refresh token is present
            const refreshToken = req.cookies.refreshToken;
            if (!refreshToken) {
                return res.status(401).json({
                    error: {
                        code: 'TOKEN_EXPIRED',
                        message: 'Access token expired and no refresh token available'
                    }
                });
            }

            let refreshDecoded;
            try {
                refreshDecoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
            } catch (error) {
                return res.status(401).json({
                    error: {
                        code: 'INVALID_REFRESH_TOKEN',
                        message: 'Invalid refresh token',
                        details: error.message
                    }
                });
            }
            
            // Verify refresh token is still valid in database
            const validRefreshToken = user.refreshTokens?.find(t => t.token === refreshToken);
            if (!validRefreshToken) {
                return res.status(401).json({
                    error: {
                        code: 'INVALID_REFRESH_TOKEN',
                        message: 'Invalid refresh token'
                    }
                });
            }
            
            try {
                // Generate new access token
                const newAccessToken = jwt.sign(
                    { username: refreshDecoded.username },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );
                
                // Set new access token cookie with secure options
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600000, // 1 hour
                    sameSite: 'strict',
                    path: '/',
                    domain: process.env.COOKIE_DOMAIN || undefined
                });
                
                // Log successful token refresh
                console.log('Access token refreshed successfully for user:', refreshDecoded.username);
                
                // Remove used refresh token and save new one
                user.refreshTokens = user.refreshTokens?.filter(t => t.token !== refreshToken) || [];
                await user.save();
                
                // Set user info in request with new token
                req.token = newAccessToken;
                req.user = refreshDecoded;
                req.admin = user;
                return next();
            } catch (error) {
                console.error('Token refresh error:', error);
                return res.status(500).json({
                    error: {
                        code: 'TOKEN_REFRESH_ERROR',
                        message: 'Failed to refresh access token',
                        details: process.env.NODE_ENV === 'development' ? error.message : undefined
                    }
                });
            }
        }
        
        // Token is valid and not expired, set user info in request
        req.token = token;
        req.user = decoded;
        req.admin = user;
        return next();
    } catch (error) {
        console.error('Auth middleware error:', error);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Internal server error during authentication',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }
        });
    }
};

// Admin authentication middleware
const isAdmin = async (req, res, next) => {
    try {
        // Check for token in cookies first (preferred method)
        let token = req.cookies.accessToken;
        
        // Fallback to Authorization header if no cookie
        if (!token && req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({
                error: {
                    code: 'NO_TOKEN',
                    message: 'No token, authorization denied'
                }
            });
        }

        let decoded;
        try {
            // Verify token
            decoded = jwt.verify(token, process.env.JWT_SECRET);
        } catch (error) {
            console.error('Token validation error:', error);
            const errorResponse = error.name === 'TokenExpiredError' ? {
                code: 'TOKEN_EXPIRED',
                message: 'Authentication token has expired'
            } : error.name === 'JsonWebTokenError' ? {
                code: 'MALFORMED_TOKEN',
                message: 'Malformed authentication token'
            } : {
                code: 'INVALID_TOKEN',
                message: 'Invalid authentication token'
            };
            
            return res.status(401).json({ error: errorResponse });
        }
        
        try {
            // Check if admin exists
            const user = await User.findOne({ username: decoded.username, isAdmin: true });
            if (!user) {
                return res.status(403).json({
                    error: {
                        code: 'ADMIN_REQUIRED',
                        message: 'Access denied. Admin privileges required.'
                    }
                });
            }
            
            // Set admin info in request
            req.token = token;
            req.user = decoded;
            req.admin = user;
            return next();
        } catch (error) {
            console.error('Admin lookup error:', error);
            return res.status(500).json({
                error: {
                    code: 'DATABASE_ERROR',
                    message: 'Error verifying admin privileges',
                    details: process.env.NODE_ENV === 'development' ? error.message : undefined
                }
            });
        }
    } catch (error) {
        console.error('Admin auth middleware error:', error);
        return res.status(500).json({
            error: {
                code: 'SERVER_ERROR',
                message: 'Internal server error during authentication',
                details: process.env.NODE_ENV === 'development' ? error.message : undefined
            }
        });
    }
};

module.exports = { auth, isAdmin };
