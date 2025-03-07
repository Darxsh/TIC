const mongoose = require('mongoose');

const eventSchema = new mongoose.Schema({
    title: { 
        type: String, 
        required: true,
        trim: true
    },
    description: { 
        type: String, 
        required: true 
    },
    date: { 
        type: Date, 
        required: true 
    },
    time: { 
        type: String, 
        required: true 
    },
    location: { 
        type: String, 
        required: true,
        trim: true
    },
    image: { 
        type: String 
    },
    capacity: { 
        type: Number,
        min: [1, 'Capacity must be at least 1']
    },
    registrations: {
        type: Number,
        default: 0,
        min: 0
    },
    status: {
        type: String,
        enum: ['upcoming', 'ongoing', 'past'],
        default: 'upcoming'
    },
    createdAt: { 
        type: Date, 
        default: Date.now 
    },
    updatedAt: { 
        type: Date, 
        default: Date.now 
    }
});

// Update the updatedAt timestamp before saving
eventSchema.pre('save', function(next) {
    this.updatedAt = new Date();
    next();
});

// Virtual for checking if event is full
eventSchema.virtual('isFull').get(function() {
    if (!this.capacity) return false;
    return this.registrations >= this.capacity;
});

// Set status based on date before saving
eventSchema.pre('save', function(next) {
    const now = new Date();
    const eventDate = new Date(this.date);
    
    if (eventDate < now) {
        this.status = 'past';
    } else if (eventDate.toDateString() === now.toDateString()) {
        this.status = 'ongoing';
    } else {
        this.status = 'upcoming';
    }
    
    next();
});

module.exports = mongoose.model('Event', eventSchema);
