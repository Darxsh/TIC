const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const fs = require('fs').promises;
const Event = require('../models/Event');
const { isAdmin } = require('../middleware/auth');

// Configure multer for image uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/uploads/events');
    },
    filename: (req, file, cb) => {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, 'event-' + uniqueSuffix + path.extname(file.originalname));
    }
});

const upload = multer({
    storage: storage,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    },
    fileFilter: (req, file, cb) => {
        const allowedTypes = /jpeg|jpg|png|gif/;
        const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
        const mimetype = allowedTypes.test(file.mimetype);
        
        if (extname && mimetype) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    }
});

// Get all events
router.get('/', async (req, res) => {
    try {
        const events = await Event.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Get a single event
router.get('/:id', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Create a new event (admin only)
router.post('/', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const eventData = {
            title: req.body.title,
            description: req.body.description,
            date: req.body.date,
            time: req.body.time,
            location: req.body.location,
            capacity: req.body.capacity
        };
        
        if (req.file) {
            eventData.image = `/uploads/events/${req.file.filename}`;
        }
        
        const event = new Event(eventData);
        const savedEvent = await event.save();
        res.status(201).json(savedEvent);
    } catch (error) {
        // If there was an error and we uploaded a file, delete it
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(400).json({ message: error.message });
    }
});

// Update an event (admin only)
router.put('/:id', isAdmin, upload.single('image'), async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // If a new image is uploaded, delete the old one
        if (req.file) {
            if (event.image) {
                const oldImagePath = path.join('public', event.image);
                await fs.unlink(oldImagePath).catch(console.error);
            }
            event.image = `/uploads/events/${req.file.filename}`;
        }
        
        event.title = req.body.title;
        event.description = req.body.description;
        event.date = req.body.date;
        event.time = req.body.time;
        event.location = req.body.location;
        event.capacity = req.body.capacity;
        
        const updatedEvent = await event.save();
        res.json(updatedEvent);
    } catch (error) {
        // If there was an error and we uploaded a file, delete it
        if (req.file) {
            await fs.unlink(req.file.path).catch(console.error);
        }
        res.status(400).json({ message: error.message });
    }
});

// Delete an event (admin only)
router.delete('/:id', isAdmin, async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Delete the event image if it exists
        if (event.image) {
            const imagePath = path.join('public', event.image);
            await fs.unlink(imagePath).catch(console.error);
        }
        
        await event.deleteOne();
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

// Register for an event
router.post('/:id/register', async (req, res) => {
    try {
        const event = await Event.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        
        // Check if the event has capacity limit and if it's full
        if (event.capacity && event.registrations >= event.capacity) {
            return res.status(400).json({ message: 'Event is already full' });
        }
        
        // Increment registrations
        event.registrations = (event.registrations || 0) + 1;
        await event.save();
        
        res.json({ message: 'Registration successful' });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
});

module.exports = router;
