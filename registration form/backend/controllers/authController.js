const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Generate JWT
const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, {
        expiresIn: '30d',
    });
};

// @desc    Register a new user
// @route   POST /api/users/register
// @access  Public
const registerUser = async (req, res) => {
    try {
        const { fullName, email, phone, username, password, gender, dateOfBirth, competition, role, college, participants } = req.body;

        // Common Validation
        if (!fullName || !email || !phone || !username || !password) {
            res.status(400);
            throw new Error('Please include all common required fields');
        }

        // Role-based Validation
        if (role === 'Coordinator') {
            if (!college) {
                res.status(400);
                throw new Error('College name is required for Coordinators');
            }
        } else {
            // Default to Participant
            if (!competition) {
                res.status(400);
                throw new Error('Competition selection is required for Participants');
            }
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
            dateOfBirth,
            competition: role === 'Coordinator' ? undefined : competition,
            role: role || 'Participant',
            college: role === 'Coordinator' ? college : undefined,
            participants: role === 'Coordinator' ? participants : undefined
        });

        if (user) {
            res.status(201).json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                role: user.role,
                ...(user.college && { college: user.college }),
                ...(user.participants && { participants: user.participants }),
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

// @desc    Authenticate User
// @route   POST /api/users/login
// @access  Public
const loginUser = async (req, res) => {
    try {
        const { emailOrUsername, password } = req.body;

        if (!emailOrUsername || !password) {
            res.status(400);
            throw new Error('Please add all fields');
        }

        // Check for user by email OR username
        const user = await User.findOne({
            $or: [{ email: emailOrUsername }, { username: emailOrUsername }]
        });

        if (user && (await user.matchPassword(password))) {
            res.json({
                _id: user._id,
                fullName: user.fullName,
                email: user.email,
                username: user.username,
                role: user.role,
                token: generateToken(user._id),
            });
        } else {
            res.status(401);
            throw new Error('Invalid credentials');
        }
    } catch (error) {
        const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
        res.status(statusCode).json({
            message: error.message,
            stack: process.env.NODE_ENV === 'production' ? null : error.stack,
        });
    }
};

// @desc    Authenticate Admin
// @route   POST /api/users/admin/login
// @access  Public
const loginAdmin = async (req, res) => {
    const { username, password } = req.body;

    if (username === process.env.ADMIN_USERNAME && password === process.env.ADMIN_PASSWORD) {
        res.json({
            _id: 'admin',
            username: 'admin',
            token: generateToken('admin'),
        });
    } else {
        res.status(400);
        res.json({ message: 'Invalid Admin Credentials' }); // Avoiding throwError for simplicity here to match existing style or just direct response
    }
};

// @desc    Get all users
// @route   GET /api/users
// @access  Private/Admin
const getUsers = async (req, res) => {
    try {
        const users = await User.find({});
        res.json(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

module.exports = {
    registerUser,
    loginAdmin,
    loginUser,
    getUsers,
};
