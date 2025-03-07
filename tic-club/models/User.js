const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
    fullName: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: { type: String, required: true, unique: true },
    department: String,
    whyJoin: String,
    experience: String,
    commitment: String,
    registrationDate: { type: Date, default: Date.now }
});

module.exports = mongoose.model('User', userSchema);
