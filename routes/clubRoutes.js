const express = require('express');
const clubController = require('../controllers/clubController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(clubController.getAllClubs)
    .post(clubController.setUserId, clubController.createClub);

router
    .route('/:id')
    .get(clubController.getClub)
    .patch(clubController.updateClub)
    .delete(clubController.deleteClub);

router.post('/:clubId/join', userController.joinClub);

module.exports = router;