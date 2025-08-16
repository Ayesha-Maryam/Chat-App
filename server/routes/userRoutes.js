const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { protect } = require('../middleware/auth');

router.get('/', protect, userController.getAllUsers);
router.put('/online-status', protect, userController.updateOnlineStatus);
router.put('/socket-id', protect, userController.updateSocketId);

module.exports = router;