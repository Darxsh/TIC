const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const nodemailer = require('nodemailer');
require('dotenv').config();
const multer = require('multer');
const fs = require('fs');
const app = express();


// Connect to MongoDB
mongoose.connect(process.env.MONGODB_URI)
.then(() => console.log('Connected to MongoDB'))
.catch(err => console.error('MongoDB connection error:', err));


// Ensure uploads directory exists
const uploadsDir = path.join(__dirname, 'public', 'uploads');
const eventsUploadsDir = path.join(uploadsDir, 'events');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}
if (!fs.existsSync(eventsUploadsDir)) {
    fs.mkdirSync(eventsUploadsDir, { recursive: true });
}

// Serve static files from public directory
app.use(express.static(path.join(__dirname, 'public')));

// Serve pages from public/pages directory
app.use('/pages', express.static(path.join(__dirname, 'public', 'pages')));

// Route for home page
app.get('/', (req, res) => {
    res.sendFile(path.join(__dirname, 'public', 'pages', 'home.html'));
});

// Placeholder image service
app.get('/api/placeholder/:width/:height', (req, res) => {
    const width = parseInt(req.params.width) || 100;
    const height = parseInt(req.params.height) || 100;
    
    // Create SVG placeholder
    const svg = `
        <svg width="${width}" height="${height}" xmlns="http://www.w3.org/2000/svg">
            <rect width="100%" height="100%" fill="#f0f0f0"/>
            <text x="50%" y="50%" font-family="Arial" font-size="14" 
                fill="#666" text-anchor="middle" dy=".3em">
                ${width}x${height}
            </text>
        </svg>
    `;
    
    res.setHeader('Content-Type', 'image/svg+xml');
    res.send(svg);
});

// Registration route
app.post('/api/register', async (req, res) => {
    try {
        const { username, email, password } = req.body;

        // Check if user already exists
        const existingUser = await User.findOne({ $or: [{phone },{ email }, { username }] });
        if (existingUser) {
            return res.status(400).json({ 
                message: 'User already exists with this email or username' 
            });
        }

        // Create new user
        const user = new User({
            username,
            email,
            password
        });

        await user.save();

        res.status(201).json({ 
            message: 'Registration successful',
            user: {
                id: user._id,
                username: user.username,
                email: user.email
            }
        });
    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ message: 'Registration failed' });
    }
});

// Configure nodemailer
const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: process.env.SMTP_PORT,
    secure: process.env.SMTP_SECURE === 'true',
    auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS
    }
});

// Verify SMTP connection
transporter.verify()
    .then(() => console.log('SMTP connection established'))
    .catch(err => console.error('SMTP connection error:', err));

// Join form submission endpoint
app.post('/api/join', async (req, res) => {
    try {
        console.log('Received form data:', req.body);

        // Check if user already exists with email or phone
        const existingUser = await User.findOne({
            $or: [
                { email: req.body.email },
                { phone: req.body.phone }
            ]
        });

        if (existingUser) {
            return res.status(400).json({ 
                message: 'A registration already exists with this email or phone number.',
                field: existingUser.email === req.body.email ? 'email' : 'phone'
            });
        }

        // Create new user from form data
        const userData = {
            fullName: req.body.name,
            email: req.body.email,
            phone: req.body.phone,
            department: req.body.department,
            whyJoin: req.body['why-join'],
            experience: req.body.experience || '',
            commitment: req.body.commitment
        };

        const user = new User(userData);
        await user.save();

        // Send confirmation email
        const mailOptions = {
            from: process.env.SMTP_USER,
            to: userData.email,
            subject: 'Welcome to TIC Club!',
            html: `
                <h2>Thank you for your interest in TIC Club!</h2>
                <p>Dear ${userData.fullName},</p>
                <p>We have received your registration request and are excited to have you join our community.</p>
                <p>Our team will review your application and get back to you soon with further information.</p>
                <p>Best regards,<br>TIC Club Team</p>
            `
        };

        await transporter.sendMail(mailOptions);

        res.status(201).json({
            message: 'Thank you for showing your interest in TIC Club! Please check your email for further information.',
            success: true
        });

    } catch (error) {
        console.error('Registration error:', error);
        res.status(500).json({ 
            message: 'Registration failed. Please try again later.',
            success: false
        });
    }
});

// Calendar API routes
app.get('/api/calendar', async (req, res) => {
    try {
        const events = await Calendar.find().sort({ date: 1 });
        res.json(events);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar events' });
    }
});

app.post('/api/calendar', async (req, res) => {
    try {
        const event = new Calendar(req.body);
        await event.save();
        res.status(201).json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error creating calendar event' });
    }
});

app.get('/api/calendar/:id', async (req, res) => {
    try {
        const event = await Calendar.findById(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(500).json({ message: 'Error fetching calendar event' });
    }
});

app.put('/api/calendar/:id', async (req, res) => {
    try {
        const event = await Calendar.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json(event);
    } catch (error) {
        res.status(400).json({ message: 'Error updating calendar event' });
    }
});

app.delete('/api/calendar/:id', async (req, res) => {
    try {
        const event = await Calendar.findByIdAndDelete(req.params.id);
        if (!event) {
            return res.status(404).json({ message: 'Event not found' });
        }
        res.json({ message: 'Event deleted successfully' });
    } catch (error) {
        res.status(500).json({ message: 'Error deleting calendar event' });
    }
});

// Handle 404
app.use((req, res) => {
    res.status(404).json({ message: 'Not Found' });
});

// Start server
const PORT = process.env.PORT || 5000;
const server = app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
}).on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
        console.log(`Port ${PORT} is busy, trying ${PORT + 1}...`);
        server.close();
        app.listen(PORT + 1, () => {
            console.log(`Server is running on port ${PORT + 1}`);
        });
    } else {
        console.error('Server error:', err);
    }
});