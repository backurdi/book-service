const Comments = require('../models/commentModel');
const factory = require('./handlerFactory');
const {setConfigVars} = require('../utils/s3');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');

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

exports.addComment = catchAsync(async(req, res, next)=>{
    if(req.photo){
        req.body.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;
    }
    const newComment = await Comments.create(req.body);
    
    const doc = await Comments.findById(newComment._id).populate({
        path:'user',
        model:'User',
        select:['name', 'photo']
    })
    
    req.comment = doc;
    next()
})

exports.updateComment = catchAsync(async (req, res, next)=>{
    if(req.photo){
        req.body.photo = `https://redee-post-pictures.s3.eu-north-1.amazonaws.com/${req.photo}`;
    }
    const doc = await Comments.findByIdAndUpdate(req.params.id, req.body, {
        new: true,
        runValidators: true
    }).populate({
        path:'user',
        model: 'User',
        select:['name', 'photo']
    });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
})