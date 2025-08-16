const express = require('express');
const router = express.Router();
const chatController = require('../controllers/chatController');
const { protect } = require('../middleware/auth');

router.get('/:receiverId', protect, chatController.getMessages);
router.post('/', protect, chatController.sendMessage);
router.put('/:messageId/read', protect, chatController.markAsRead);

module.exports = router;