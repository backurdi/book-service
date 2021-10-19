const express = require('express');
const postController = require('../controllers/postsController');
const authController = require('../controllers/authController');
const commentRouter = require('./commentRoutes');
const photoMidleware = require('../utils/midleware/photo');

const router = express.Router();

router.use(authController.protect);

router.use('/:postId/comments', commentRouter);

router
    .route('/')
    .get(postController.getAllPosts)
    .post(postController.setS3Config,
        photoMidleware.uploadPhoto,
        photoMidleware.resizePhoto,
        photoMidleware.uploadToS3,
        postController.setUserId,
        postController.createPost
        );

router
    .route('/:id')
    .get(postController.getPost)
    .patch(postController.setS3Config,
        photoMidleware.uploadPhoto,
        photoMidleware.resizePhoto,
        photoMidleware.uploadToS3,
        postController.setUserId,
        postController.updatePost)
    .delete(postController.deletePost);

module.exports = router;
