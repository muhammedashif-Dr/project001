const jwt = require('jsonwebtoken');
const User = require('../models/User');

const protect = async (req, res, next) => {
    let token;

    if (req.headers.authorization && req.headers.authorization.startsWith('Bearer')) {
        try {
            // Get token from header
            token = req.headers.authorization.split(' ')[1];

            // Verify token
            const decoded = jwt.verify(token, process.env.JWT_SECRET);

            // Get user from the token (if it was a user token) - for Admin we might just check a flag or separate middleware
            // But here we are doing simple Admin Auth where the token just needs to be valid and contain "admin" role or similar
            // OR checks against env.

            // For this simple requiremenet: "generate user and password for admin and implement .env file"
            // We will sign the token with an "id" of 'admin'

            if (decoded.id === 'admin') {
                req.user = { id: 'admin', isAdmin: true };
                next();
            } else {
                // If we had regular user logins, we would fetch user here.
                res.status(401);
                throw new Error('Not authorized as admin');
            }

        } catch (error) {
            console.log(error);
            res.status(401);
            throw new Error('Not authorized');
        }
    }

    if (!token) {
        res.status(401);
        throw new Error('Not authorized, no token');
    }
};

module.exports = { protect };
