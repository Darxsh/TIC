require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const cors = require('cors');
const morgan = require('morgan');
const multer = require('multer');
const fs = require('fs');
const upload = multer({
    storage: multer.diskStorage({
        destination: function(req, file, cb) {
            const uploadsDir = path.join(__dirname, 'public', 'uploads');
            cb(null, uploadsDir);
        },
        filename: function(req, file, cb) {
            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            cb(null, file.fieldname + '-' + uniqueSuffix + path.extname(file.originalname));
        }
    }),
    fileFilter: function(req, file, cb) {
        const filetypes = /jpeg|jpg|png|gif/;
        const mimetype = filetypes.test(file.mimetype);
        const extname = filetypes.test(path.extname(file.originalname).toLowerCase());
        if (mimetype && extname) {
            return cb(null, true);
        }
        cb(new Error('Only image files are allowed!'));
    },
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

// Import routes
const adminRoutes = require('./routes/admin');
const publicRoutes = require('./routes/public');
const Content = require('./models/Content'); 
const User = require('./models/User'); 
const authenticateToken = require('./middleware/authenticateToken'); 

const app = express();

// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
    .then(() => console.log('Connected to MongoDB'))
    .catch(err => console.error('MongoDB connection error:', err));

// Middleware
app.use(morgan('dev')); // Logging
app.use(cors()); // Enable CORS
app.use(express.json()); // Parse JSON bodies
app.use(express.urlencoded({ extended: true })); // Parse URL-encoded bodies

// Serve static files
app.use(express.static(path.join(__dirname, 'public')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Routes
app.use('/api/admin', adminRoutes);
app.use('/api', publicRoutes);

// Serve admin dashboard
app.get('/admin', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/login.html'));
});

app.get('/admin/dashboard', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/admin/dashboard.html'));
});

// Serve main pages
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public/home.html'));
});

// Get all content
app.get('/api/admin/content', authenticateToken, async (req, res) => {
    try {
        const contents = await Content.find().sort({ type: 1, order: 1 });
        res.json(contents);
    } catch (error) {
        console.error('Error getting content:', error);
        res.status(500).json({ error: 'Failed to get content' });
    }
});

// Get content by type
app.get('/api/content', async (req, res) => {
    try {
        const { type, isActive } = req.query;
        const query = {};
        
        if (type) query.type = type;
        if (isActive !== undefined) query.isActive = isActive === 'true';

        const contents = await Content.find(query).sort({ order: 1 });
        res.json(contents);
    } catch (error) {
        console.error('Error getting content:', error);
        res.status(500).json({ error: 'Failed to get content' });
    }
});

app.post('/api/admin/content', authenticateToken, async (req, res) => {
    try {
        const content = new Content(req.body);
        await content.save();
        res.status(201).json(content);
    } catch (error) {
        console.error('Error creating content:', error);
        res.status(500).json({ error: 'Failed to create content' });
    }
});

app.put('/api/admin/content/:id', authenticateToken, async (req, res) => {
    try {
        const content = await Content.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!content) return res.status(404).json({ error: 'Content not found' });
        res.json(content);
    } catch (error) {
        console.error('Error updating content:', error);
        res.status(500).json({ error: 'Failed to update content' });
    }
});

app.delete('/api/admin/content/:id', authenticateToken, async (req, res) => {
    try {
        const content = await Content.findByIdAndDelete(req.params.id);
        if (!content) return res.status(404).json({ error: 'Content not found' });
        res.json({ message: 'Content deleted successfully' });
    } catch (error) {
        console.error('Error deleting content:', error);
        res.status(500).json({ error: 'Failed to delete content' });
    }
});

app.patch('/api/admin/content/:id/toggle', authenticateToken, async (req, res) => {
    try {
        const { isActive } = req.body;
        const content = await Content.findByIdAndUpdate(
            req.params.id,
            { isActive },
            { new: true }
        );
        if (!content) return res.status(404).json({ error: 'Content not found' });
        res.json(content);
    } catch (error) {
        console.error('Error toggling content status:', error);
        res.status(500).json({ error: 'Failed to toggle content status' });
    }
});

// Image upload endpoint
app.post('/api/admin/upload', authenticateToken, upload.single('image'), (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ error: 'No image file provided' });
        }

        // Convert backslashes to forward slashes for URLs
        const imagePath = '/uploads/' + req.file.filename;
        res.json({ imagePath });
    } catch (error) {
        console.error('Error uploading image:', error);
        res.status(500).json({ error: 'Failed to upload image' });
    }
});

// Dashboard counts endpoint
app.get('/api/admin/dashboard/counts', authenticateToken, async (req, res) => {
    try {
        const [
            totalContent,
            activeEvents,
            galleryItems,
            teamMembers
        ] = await Promise.all([
            Content.countDocuments(),
            Content.countDocuments({ type: 'event', isActive: true }),
            Content.countDocuments({ type: 'gallery', isActive: true }),
            Content.countDocuments({ type: 'team', isActive: true })
        ]);

        res.json({
            totalContent,
            activeEvents,
            galleryItems,
            teamMembers
        });
    } catch (error) {
        console.error('Error fetching dashboard counts:', error);
        res.status(500).json({ error: 'Failed to fetch dashboard counts' });
    }
});

// Add join form submission endpoint
app.post('/api/join', async (req, res) => {
    try {
        // Create new user from form data
        const user = new User({
            fullName: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            whyJoin: req.body['why-join'],
            experience: req.body.experience,
            commitment: req.body.commitment
        });

        // Save user to database
        await user.save();
        res.status(201).json({ message: 'Application submitted successfully!' });
    } catch (error) {
        console.error('Error submitting application:', error);
        if (error.code === 11000) { // Duplicate key error
            res.status(400).json({ message: 'Email or phone number already registered' });
        } else {
            res.status(500).json({ message: 'Failed to submit application. Please try again.' });
        }
    }
});

// Error handling middleware
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Something went wrong!' });
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Not found' });
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
