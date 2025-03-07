const express = require('express');
const router = express.Router();
const jwt = require('jsonwebtoken');
const User = require('../models/User');
const Content = require('../models/Content');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');
const Team = require('../models/Team');
const Calendar = require('../models/Calendar');

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

// Admin login
router.post('/login', async (req, res) => {
    try {
        const { username, password } = req.body;
        const user = await User.findOne({ username });

        if (!user || !user.isAdmin) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const isValid = await user.comparePassword(password);
        if (!isValid) {
            return res.status(401).json({ message: 'Invalid credentials' });
        }

        const token = jwt.sign(
            { userId: user._id },
            process.env.JWT_SECRET,
            { expiresIn: '24h' }
        );

        res.cookie('adminToken', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000 // 24 hours
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        res.status(500).json({ message: 'Login failed' });
    }
});

// Admin logout
router.post('/logout', (req, res) => {
    res.clearCookie('adminToken');
    res.json({ message: 'Logged out successfully' });
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

module.exports = router;
