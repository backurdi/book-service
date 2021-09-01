const express = require('express');
const clubController = require('../controllers/clubController');
const userController = require('../controllers/userController');
const authController = require('../controllers/authController');
const photoMidleware = require('../utils/midleware/photo');

const router = express.Router();

router.use(authController.protect);

router
    .route('/')
    .get(clubController.getAllClubs)
    .post(
        clubController.setS3Config,
        photoMidleware.uploadPhoto,
        photoMidleware.resizePhoto,
        photoMidleware.uploadToS3,
        clubController.setUserId, clubController.createClub);

router
    .route('/:id')
    .get(clubController.getClub)
    .patch(clubController.updateClub)
    .delete(clubController.deleteClub);

router.post('/answerInvite', clubController.clubInvitesAnswer);
router.get('/:clubId/usersForInvite', clubController.usersForInvite)
router.post('/:clubId/inviteUsers', clubController.inviteUsers);
router.post('/:clubId/join', userController.joinClub);

module.exports = router;