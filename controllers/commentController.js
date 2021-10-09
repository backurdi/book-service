const Comments = require('../models/commentModel');
const factory = require('./handlerFactory');
const {setConfigVars} = require('../utils/s3');
const catchAsync = require('../utils/catchAsync');

exports.setPostUserIds = (req, res, next) => {
    if (!req.body.post) req.body.post = req.params.postId;
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.setS3Config = (req, res, next)=>{
    setConfigVars('postPicture');
    req.s3FileName = 'comment';

    next();
}

exports.getComments = factory.getAll(Comments);
exports.addComment = factory.createOne(Comments);
exports.deleteComment = factory.deleteOne(Comments);
exports.updateComment = factory.updateOne(Comments);

exports.addComment = catchAsync(async(req, res, next)=>{
    if(req.photo){
        req.body.photo = `https://redee-post-pictures.s3.eu-north-1.amazonaws.com/${req.photo}`;
    }
    const doc = await Comments.create(req.body);

    res.status(201).send({
        status: 'success',
        data: doc
    });
})
