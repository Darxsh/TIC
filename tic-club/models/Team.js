const mongoose = require('mongoose');

const teamSchema = new mongoose.Schema({
    name: { type: String, required: true },
    role: { type: String, required: true },
    department: { type: String, required: true },
    imageUrl: { type: String },
    description: { type: String },
    socialLinks: {
        linkedin: String,
        github: String,
        twitter: String
    },
    createdAt: { type: Date, default: Date.now },
    updatedAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model('Team', teamSchema);
