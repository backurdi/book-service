const express = require('express');
const postController = require('../controllers/postsController');
const authController = require('../controllers/authController');
const commentRouter = require('./commentRoutes');

const router = express.Router();

router.use(authController.protect);

router.use('/:postId/comments', commentRouter);

router
    .route('/')
    .get(postController.getAllPosts)
    .post(postController.setUserIds, postController.createPost);

router
    .route('/:id')
    .get(postController.getPost)
    .patch(postController.updatePost)
    .delete(postController.deletePost);

module.exports = router;
