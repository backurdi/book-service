const express = require('express');
const userController = require('./../controllers/userController');
const authController = require('./../controllers/authController');
const photoMidleware = require('../utils/midleware/photo');

const router = express.Router();

router.post('/signup', authController.signup);
router.post('/login', authController.login);
router.get('/logout', authController.logout);

router.post('/forgotPassword', authController.forgotPassword);
router.patch('/resetPassword/:token', authController.resetPassword);



router.use(authController.protect);

router.patch('/updatePassword', authController.updatePassword);

router.get('/me', userController.getMe, userController.getUser);
router.patch(
    '/updateMe',
    userController.setS3Config,
    photoMidleware.uploadPhoto,
    photoMidleware.resizePhoto,
    photoMidleware.uploadToS3,
    userController.updateMe
);
router.delete('/deleteMe', userController.deleteMe);

router.patch('/teacher', userController.setTeacher);

// router.use(authController.restrictTo('Teacher'));
router.get('/students',authController.restrictTo('Teacher'), userController.getStudents);

router
.route('/')
.get(userController.getAllUsers)
.post(userController.createUser);

router
.route('/:id')
.get(userController.getUser)
.patch(userController.updateUser)
.delete(userController.deleteUser);



module.exports = router;