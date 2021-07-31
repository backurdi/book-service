const express = require('express');
const bookController = require('../controllers/bookController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(bookController.getAllBooks)
    .post(bookController.createBook);

router
    .route('/:id')
    .get(bookController.getBook)
    .put(bookController.updateBook)
    .delete(bookController.deleteBook);

module.exports = router;
