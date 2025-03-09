const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const axios = require('axios');
const User = require('../models/User');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Team = require('../models/Team');
const Calendar = require('../models/Calendar');
const { authenticateToken } = require('../middleware/auth');

// Authentication middleware
const authenticateAdmin = async (req, res, next) => {
    try {
        const token = req.cookies.adminToken;
        if (!token) {
            return res.status(401).json({ message: 'Authentication required' });
        }

        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        const user = await User.findById(decoded.userId);
        
        if (!user || !user.isAdmin) {
            return res.status(403).json({ message: 'Admin access required' });
        }

        req.user = user;
        next();
    } catch (error) {
        res.status(401).json({ message: 'Invalid or expired token' });
    }
};

// Admin login with reCAPTCHA verification
router.post('/api/admin/login', async (req, res) => {
    try {
        const { username, password, recaptchaResponse } = req.body;

        // Verify reCAPTCHA
        const recaptchaVerification = await axios.post(
            'https://www.google.com/recaptcha/api/siteverify',
            null,
            {
                params: {
                    secret: process.env.RECAPTCHA_SECRET_KEY,
                    response: recaptchaResponse
                }
            }
        );

        if (!recaptchaVerification.data.success) {
            return res.status(400).json({ message: 'reCAPTCHA verification failed' });
        }

        // Verify credentials
        const user = await User.findOne({ username });
        if (!user || !user.isAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const validPassword = await user.comparePassword(password);
        if (!validPassword) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        // Generate tokens
        const accessToken = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_SECRET,
            { expiresIn: '1h' }
        );

        const refreshToken = jwt.sign(
            { username, role: 'admin' },
            process.env.JWT_REFRESH_SECRET,
            { expiresIn: '7d' }
        );

        // Set secure HTTP-only cookies
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 3600000 // 1 hour
        });

        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 604800000 // 7 days
        });

        res.json({ message: 'Login successful' });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
});

// Protected admin routes
router.use(authenticateAdmin);

// Content management
router.get('/content', async (req, res) => {
    try {
        const content = await Content.find();
        res.json(content);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch content' });
    }
});

router.post('/content', async (req, res) => {
    try {
        const content = new Content(req.body);
        await content.save();
        res.status(201).json(content);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create content' });
    }
});

// Event management
router.get('/events', async (req, res) => {
    try {
        const events = await Event.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch events' });
    }
});

router.post('/events', async (req, res) => {
    try {
        const event = new Event(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create event' });
    }
});

// Gallery management
router.get('/gallery', async (req, res) => {
    try {
        const gallery = await Gallery.find();
        res.json(gallery);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch gallery items' });
    }
});

router.post('/gallery', async (req, res) => {
    try {
        const item = new Gallery(req.body);
        await item.save();
        res.status(201).json(item);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create gallery item' });
    }
});

// Team management
router.get('/team', async (req, res) => {
    try {
        const team = await Team.find();
        res.json(team);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch team members' });
    }
});

router.post('/team', async (req, res) => {
    try {
        const member = new Team(req.body);
        await member.save();
        res.status(201).json(member);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create team member' });
    }
});

// Calendar management
router.get('/calendar', async (req, res) => {
    try {
        const events = await Calendar.find();
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Failed to fetch calendar events' });
    }
});

router.post('/calendar', async (req, res) => {
    try {
        const event = new Calendar(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(500).json({ message: 'Failed to create calendar event' });
    }
});

// Token verification endpoint
router.get('/api/admin/verify', authenticateToken, (req, res) => {
    res.json({ valid: true });
});

// Logout endpoint
router.post('/api/admin/logout', (req, res) => {
    res.clearCookie('accessToken');
    res.clearCookie('refreshToken');
    res.json({ message: 'Logged out successfully' });
});

// Protected calendar events management
router.get('/api/admin/calendar-events', authenticateToken, async (req, res) => {
    try {
        const events = await Calendar.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
});

module.exports = router;
