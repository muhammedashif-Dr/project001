const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = mongoose.Schema({
    fullName: {
        type: String,
        required: [true, 'Please add a full name']
    },
    email: {
        type: String,
        required: [true, 'Please add an email'],
        unique: true,
        match: [
            /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
            'Please add a valid email'
        ]
    },
    phone: {
        type: String,
        required: [true, 'Please add a phone number']
    },
    username: {
        type: String,
        required: [true, 'Please add a username'],
        unique: true
    },
    password: {
        type: String,
        required: [true, 'Please add a password']
    },
    gender: {
        type: String,
        enum: ['Male', 'Female', 'Other'], // optional enum validation
        required: false
    },
    dateOfBirth: {
        type: Date,
        required: false
    },
    competition: {
        type: String,
        required: function () { return this.role === 'Participant'; }, // Only required for Participants
        enum: ['Debugging', 'Quiz', 'Gestura', 'Paper Presentation', 'Reels Stopper', 'Promotion', 'Business Analytics', 'Speaking on Stage']
    },
    role: {
        type: String,
        enum: ['Participant', 'Coordinator'],
        default: 'Participant'
    },
    college: {
        type: String,
        required: function () { return this.role === 'Coordinator'; } // Only required for Coordinators
    },
    participants: [{
        name: String,
        event: String,
        gender: String
    }]
}, {
    timestamps: true
});

// Encrypt password using bcrypt before saving
userSchema.pre('save', async function (next) {
    if (!this.isModified('password')) {
        next();
    }

    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
    return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
