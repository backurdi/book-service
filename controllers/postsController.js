const factory = require('./handlerFactory');
const Posts = require('../models/postModel');
const {setConfigVars} = require('../utils/s3');
const catchAsync = require('../utils/catchAsync');

exports.setUserId = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
};

exports.setS3Config = (req, res, next)=>{
    setConfigVars('postPicture');
    req.s3FileName = 'post';

    next();
}

exports.getAllPosts = factory.getAll(Posts);
exports.getPost = factory.getOne(Posts);
exports.updatePost = factory.updateOne(Posts);
exports.deletePost = factory.deleteOne(Posts);

exports.createPost = catchAsync(async (req, res, next) => {
    if(req.photo){
        req.body.photo = `https://redee-${req.s3FileName}-pictures.s3.eu-north-1.amazonaws.com/${req.photo}`;
    }
    const doc = await Posts.create(req.body);

    res.status(201).send({
        status: 'success',
        data: doc
    });
});