const factory = require('./handlerFactory');
const Posts = require('../models/postModel');
const { setConfigVars } = require('../utils/s3');
const catchAsync = require('../utils/catchAsync');
const AppError = require('./../utils/appError');

exports.setUserId = (req, res, next) => {
  if (!req.body.user) req.body.user = req.user.id;

  next();
};

exports.setS3Config = (req, res, next) => {
  setConfigVars('postPicture');
  req.s3FileName = 'post';

  next();
};

exports.getAllPosts = catchAsync(async (req, res, next) => {
  //To allow for nested GET reviews on tour (hack)
  let filter = {};
  if (req.params.clubId) {
    filter = {
      club: req.params.clubId,
    };
  }

  const count = await Posts.find(filter).count();

  const query = Posts.find(filter).sort({ createdAt: -1 });
  if (req.query.page) {
    const skip = (req.query.page - 1) * req.query.limit;
    query.skip(skip);
  }
  if (req.query.limit) {
    query.limit(+req.query.limit);
  }
  query.populate({
    path: 'user',
    model: 'User',
    select: ['name', 'photo'],
  });

  query.populate({
    path: 'comments',
    model: 'Comments',
    populate: {
      path: 'user',
      model: 'User',
      select: ['name', 'photo'],
    },
    options: { sort: { createdAt: 1 } },
  });
  const doc = await query;

  res.status(200).json({
    status: 'success',
    count,
    data: doc,
  });
});

exports.getPost = factory.getOne(Posts, {
  path: 'user',
  model: 'User',
  select: ['name', 'photo'],
});
exports.deletePost = factory.deleteOne(Posts);

exports.updatePost = catchAsync(async (req, res, next) => {
  const bodyFields = Object.keys(req.body).filter(
    field => req.body[field] !== '0' && req.body[field] !== ''
  );
  const body = {};

  bodyFields.forEach(field => {
    body[field] = req.body[field];
  });

  if (req.photo) {
    body.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;
  }

  const doc = await Posts.findByIdAndUpdate(req.params.id, body, {
    new: true,
    runValidators: true,
    populate: {
      path: 'user',
      model: 'User',
      select: ['name', 'photo'],
    },
  }).populate({
    path: 'comments',
    populate: {
      path: 'user',
      model: 'User',
      select: ['name', 'photo'],
    },
  });

  if (!doc) {
    return next(new AppError('No document found with that ID', 404));
  }

  res.status(200).json({
    status: 'success',
    data: doc,
  });
});

exports.createPost = catchAsync(async (req, res, next) => {
  if (req.photo) {
    req.body.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;
  }

  req.body.owner = req.user._id;

  const newPost = await Posts.create(req.body);

  await Posts.findByIdAndUpdate(
    { _id: newPost._id },
    {
      $addToSet: {
        subscriptions: { ...req.user.subscriptions, user: req.user._id },
      },
    },
    { new: true }
  );

  const post = await Posts.findById(newPost._id).populate({
    path: 'user',
    model: 'User',
    select: ['name', 'photo'],
  });

  req.post = post;

  next();
});
