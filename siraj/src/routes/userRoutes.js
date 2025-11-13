const express = require('express');
const { protect } = require('../middleware/authMiddleware');
const roleCheck = require('../middleware/roleMiddleware');
const { getAllUsers, makeAdmin } = require('../controllers/userController');

const router = express.Router();

router.get('/', protect, roleCheck('admin'), getAllUsers);
router.put('/make-admin/:userId', protect, roleCheck('admin'), makeAdmin);

module.exports = router;
