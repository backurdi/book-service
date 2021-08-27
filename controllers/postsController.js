const factory = require('./handlerFactory');
const Posts = require('../models/postModel');

exports.setUserIds = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllPosts = factory.getAll(Posts);
exports.getPost = factory.getOne(Posts);
exports.createPost = factory.createOne(Posts);
exports.updatePost = factory.updateOne(Posts);
exports.deletePost = factory.deleteOne(Posts);