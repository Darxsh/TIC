const jwt = require('jsonwebtoken');
const User = require('../models/User');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
    try {
        // Check for access token in HTTP-only cookie
        const accessToken = req.cookies.accessToken;
        const refreshToken = req.cookies.refreshToken;

        if (!accessToken) {
            if (!refreshToken) {
                return res.status(401).json({
                    error: {
                        code: 'NO_TOKEN',
                        message: 'Authentication required'
                    }
                });
            }

            // Try to refresh the access token
            try {
                const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                const user = await User.findOne({ username: decoded.username, isAdmin: true });

                if (!user) {
                    return res.status(401).json({
                        error: {
                            code: 'INVALID_TOKEN',
                            message: 'Invalid refresh token'
                        }
                    });
                }

                // Generate new access token
                const newAccessToken = jwt.sign(
                    { username: user.username, role: 'admin' },
                    process.env.JWT_SECRET,
                    { expiresIn: '1h' }
                );

                // Set new access token in cookie
                res.cookie('accessToken', newAccessToken, {
                    httpOnly: true,
                    secure: process.env.NODE_ENV === 'production',
                    maxAge: 3600000 // 1 hour
                });

                req.user = { username: user.username, role: 'admin' };
                return next();
            } catch (error) {
                return res.status(401).json({
                    error: {
                        code: 'REFRESH_TOKEN_EXPIRED',
                        message: 'Session expired, please login again'
                    }
                });
            }
        }

        // Verify access token
        try {
            const decoded = jwt.verify(accessToken, process.env.JWT_SECRET);
            const user = await User.findOne({ username: decoded.username, isAdmin: true });

            if (!user) {
                return res.status(401).json({
                    error: {
                        code: 'INVALID_TOKEN',
                        message: 'Invalid access token'
                    }
                });
            }

            req.user = { username: user.username, role: 'admin' };
            next();
        } catch (error) {
            if (error.name === 'TokenExpiredError' && refreshToken) {
                // Handle token refresh
                try {
                    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
                    const user = await User.findOne({ username: decoded.username, isAdmin: true });

                    if (!user) {
                        return res.status(401).json({
                            error: {
                                code: 'INVALID_TOKEN',
                                message: 'Invalid refresh token'
                            }
                        });
                    }

                    // Generate new access token
                    const newAccessToken = jwt.sign(
                        { username: user.username, role: 'admin' },
                        process.env.JWT_SECRET,
                        { expiresIn: '1h' }
                    );

                    // Set new access token in cookie
                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        maxAge: 3600000 // 1 hour
                    });

                    req.user = { username: user.username, role: 'admin' };
                    next();
                } catch (error) {
                    return res.status(401).json({
                        error: {
                            code: 'REFRESH_TOKEN_EXPIRED',
                            message: 'Session expired, please login again'
                        }
                    });
                }
            } else {
                return res.status(401).json({
                    error: {
                        code: error.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'INVALID_TOKEN',
                        message: error.name === 'TokenExpiredError' ? 'Token expired' : 'Invalid token'
                    }
                });
            }
        }
    } catch (error) {
        console.error('Authentication error:', error);
        return res.status(500).json({
            error: {
                code: 'AUTH_ERROR',
                message: 'Authentication error occurred'
            }
        });
    }
};

module.exports = { authenticateToken };
