const express = require('express');
const imageController = require('../controllers/imageController');

const router = express.Router();

router.get('/:key', imageController.setS3Config, imageController.getImage);

module.exports = router;