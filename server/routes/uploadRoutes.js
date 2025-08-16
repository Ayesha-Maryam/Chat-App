const express = require('express');
const router = express.Router();
const uploadController = require('../controllers/uploadController');
const upload = require('../utils/fileUpload');
const { protect } = require('../middleware/auth');

router.post('/', protect, upload.single('file'), uploadController.uploadFile);

module.exports = router;