const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
    username: {
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    password: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true,
        trim: true,
        lowercase: true
    },
    isAdmin: {
        type: Boolean,
        default: false
    },
    lastLogin: {
        type: Date
    },
    passwordResetToken: String,
    passwordResetExpires: Date,
    failedLoginAttempts: {
        type: Number,
        default: 0
    },
    accountLocked: {
        type: Boolean,
        default: false
    },
    lockUntil: Date
}, {
    timestamps: true
});

// Hash password before saving
userSchema.pre('save', async function(next) {
    if (!this.isModified('password')) return next();
    
    try {
        const salt = await bcrypt.genSalt(12);
        this.password = await bcrypt.hash(this.password, salt);
        next();
    } catch (error) {
        next(error);
    }
});

// Compare password method
userSchema.methods.comparePassword = async function(candidatePassword) {
    try {
        return await bcrypt.compare(candidatePassword, this.password);
    } catch (error) {
        throw error;
    }
};

// Handle failed login attempts
userSchema.methods.handleFailedLogin = async function() {
    this.failedLoginAttempts += 1;
    
    // Lock account after 5 failed attempts
    if (this.failedLoginAttempts >= 5) {
        this.accountLocked = true;
        this.lockUntil = new Date(Date.now() + 30 * 60 * 1000); // Lock for 30 minutes
    }
    
    await this.save();
};

// Reset failed login attempts
userSchema.methods.resetFailedAttempts = async function() {
    this.failedLoginAttempts = 0;
    this.accountLocked = false;
    this.lockUntil = undefined;
    await this.save();
};

// Check if account is locked
userSchema.methods.isLocked = function() {
    if (!this.accountLocked) return false;
    
    // Check if lock period has expired
    if (this.lockUntil && this.lockUntil < new Date()) {
        this.accountLocked = false;
        this.failedLoginAttempts = 0;
        this.lockUntil = undefined;
        this.save();
        return false;
    }
    
    return true;
};

// Update last login
userSchema.methods.updateLastLogin = async function() {
    this.lastLogin = new Date();
    await this.save();
};

const User = mongoose.model('User', userSchema);

module.exports = User;
