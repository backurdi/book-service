const express = require('express');
const commentController = require('../controllers/commentController');
const authController = require('../controllers/authController');
const notificationController = require('../controllers/notificationController');
const photoMidleware = require('../utils/midleware/photo');

const router = express.Router({ mergeParams: true });

router.use(authController.protect);

router
  .route('/')
  .get(commentController.getComments)
  .post(
    commentController.setS3Config,
    photoMidleware.uploadPhoto,
    photoMidleware.resizePhoto,
    photoMidleware.uploadToS3,
    commentController.setPostUserIds,
    commentController.addComment,
    notificationController.setSubscriptionOnPost,
    notificationController.commentNotification,
    notificationController.pushCommentNotification
  );

router
  .route('/:id')
  .patch(
    commentController.setS3Config,
    photoMidleware.uploadPhoto,
    photoMidleware.resizePhoto,
    photoMidleware.uploadToS3,
    commentController.setPostUserIds,
    commentController.updateComment
  )
  .delete(commentController.deleteComment);

module.exports = router;
