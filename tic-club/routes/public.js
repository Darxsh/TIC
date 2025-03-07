const express = require('express');
const router = express.Router();
const Content = require('../models/Content');
const Event = require('../models/Event');
const Gallery = require('../models/Gallery');

// Get all content of a specific type
router.get('/content', async (req, res) => {
    try {
        const { type } = req.query;
        const query = type ? { type, isActive: true } : { isActive: true };
        const content = await Content.find(query)
            .sort({ type: 1, order: 1, createdAt: -1 });
        res.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: error.message });
    }
});

// Get latest events
router.get('/events', async (req, res) => {
    try {
        const { limit = 10, page = 1, upcoming = false } = req.query;
        const query = upcoming ? { date: { $gte: new Date() } } : {};
        
        const events = await Event.find(query)
            .sort({ date: upcoming ? 1 : -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        res.json(events);
    } catch (error) {
        console.error('Error fetching events:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Get achievements
router.get('/achievements', async (req, res) => {
    try {
        const achievements = await Content.find({ 
            type: 'achievement',
            isActive: true 
        })
        .sort({ order: 1, createdAt: -1 });
        res.json(achievements);
    } catch (error) {
        console.error('Error fetching achievements:', error);
        res.status(500).json({ message: error.message });
    }
});

// Public content routes
router.get('/content/:type', async (req, res) => {
    try {
        const { type } = req.params;
        
        // Validate content type
        const validTypes = ['about', 'mission', 'vision', 'achievement', 'announcement', 'event'];
        if (!validTypes.includes(type)) {
            return res.status(400).json({ message: 'Invalid content type' });
        }

        const content = await Content.find({ 
            type,
            isActive: true 
        }).sort('order');

        // If no content found, return empty array instead of error
        if (!content || content.length === 0) {
            return res.json([]);
        }

        res.json(content);
    } catch (error) {
        console.error('Error fetching content:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// Gallery routes
router.get('/gallery', async (req, res) => {
    try {
        const { limit = 12, page = 1 } = req.query;
        
        const gallery = await Gallery.find()
            .sort({ createdAt: -1 })
            .limit(parseInt(limit))
            .skip((parseInt(page) - 1) * parseInt(limit));
            
        res.json(gallery);
    } catch (error) {
        console.error('Error fetching gallery:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
