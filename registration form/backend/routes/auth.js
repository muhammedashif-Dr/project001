const express = require('express');
const router = express.Router();
const { registerUser, loginAdmin, getUsers, loginUser } = require('../controllers/authController');
const { protect } = require('../middleware/authMiddleware');

router.post('/register', registerUser);
router.post('/login', loginUser);
router.post('/admin/login', loginAdmin);
router.get('/', protect, getUsers);

module.exports = router;
