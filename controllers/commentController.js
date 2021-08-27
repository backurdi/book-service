const Comments = require('../models/commentModel');
const factory = require('./handlerFactory');

exports.setPostkUserIds = (req, res, next) => {
    if (!req.body.post) req.body.post = req.params.postId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getComments = factory.getAll(Comments);
exports.addComment = factory.createOne(Comments);
exports.deleteComment = factory.deleteOne(Comments);
exports.updateComment = factory.updateOne(Comments);

