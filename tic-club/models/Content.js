const mongoose = require('mongoose');

const contentSchema = new mongoose.Schema({
    page: {
        type: String,
        required: true,
        enum: ['home', 'about', 'events', 'gallery', 'team', 'membership', 'calendar', 'projects']
    },
    section: {
        type: String,
        required: true,
        enum: ['header', 'banner', 'about', 'mission', 'vision', 'features', 'achievements', 
               'announcements', 'events', 'team', 'testimonials', 'contact', 'footer']
    },
    type: {
        type: String,
        required: true,
        enum: ['text', 'html', 'image', 'video', 'link', 'button', 'form', 'map', 'social']
    },
    title: {
        type: String,
        required: true
    },
    subtitle: String,
    content: {
        type: String,
        required: true
    },
    metadata: {
        image: String,
        video: String,
        link: String,
        icon: String,
        buttonText: String,
        buttonLink: String,
        backgroundColor: String,
        textColor: String
    },
    styles: {
        type: Map,
        of: String,
        default: {}
    },
    order: {
        type: Number,
        default: 0
    },
    isActive: {
        type: Boolean,
        default: true
    },
    isEditable: {
        type: Boolean,
        default: true
    },
    lastEditedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Admin'
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
contentSchema.pre('save', function(next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Content', contentSchema);
