const User = require('../models/User');

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, username, password, gender, dateOfBirth } = req.body;

        // Validation
        if (!fullName || !email || !phone || !username || !password) {
            res.status(400);
            throw new Error('Please include all required fields');
        }

        // Check if user already exists
        const userExists = await User.findOne({ email });

        if (userExists) {
            res.status(400);
            throw new Error('User already exists');
        }

        // Check if username is taken
        const usernameExists = await User.findOne({ username });

        if (usernameExists) {
            res.status(400);
            throw new Error('Username already taken');
        }

        // Create user
        const user = await User.create({
            fullName,
            email,
            phone,
            username,
            password,
            gender,
            dateOfBirth
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                phone: user.phone,
                gender: user.gender,
                dob: user.dateOfBirth,
                message: "User registered successfully"
            });
        } else {
            res.status(400);
            throw new Error('Invalid user data');
        }
    } catch (error) {
        // If status code is 200 (default), set it to 500 (server error), otherwise use existing status
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
        });
    }
};

module.exports = {
    registerUser,
};
