/* eslint-disable no-await-in-loop */
const webpush = require('web-push');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');
const APIFeatures = require('./../utils/apiFeatures');

const User = require('./../models/userModel');
const Post = require('./../models/postModel');
const Notifications = require('../models/notificationModel');

const publicVapidKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateVapidKey = process.env.WEB_PUSH_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

exports.subscribe = catchAsync(async (req, res, next) => {
  // Get pushSubscription object
  const subscription = req.body;
  await User.findByIdAndUpdate(req.user._id, { subscription });

  // Send 201 - when resource created
  res.status(201).json({});
});

// exports.notificationSocket = catchAsync(async (req, res, next) => {
//   req.app.io.emit('notification', { message: 'test message' });

//   res.status(200).json({
//     message: 'Success',
//   });
// });

exports.postNotification = (req, res, next) => {
  // Create payload
  const payload = JSON.stringify({ title: 'Push Test' });

  // Pass object into sendNotification
  webpush
    .sendNotification(req.user.subscription, payload)
    .catch(err => new AppError(err));
};

exports.getNotifications = catchAsync(async (req, res, next) => {
  let notificationsQuery = Notifications.find({
    receiver: req.user._id,
  }).sort({ createdAt: -1 });

  notificationsQuery = paginate(notificationsQuery, req.query);

  notificationsQuery.populate({
    path: 'post',
    model: 'Posts',
    select: ['club'],
  });

  const notifications = await notificationsQuery;
  const count = await Notifications.find({
    receiver: req.user._id,
  }).count();

  res.status(200).json({
    message: 'Success',
    data: {
      notifications,
      count,
    },
  });
});

exports.commentNotification = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.comment.post);
  req.post = post;
  const usersToNotify = post.subscriptions.map(
    subscription => subscription.user
  );

  for (let i = 0; i < usersToNotify.length; i += 1) {
    const existingNotifications = await Notifications.find({
      createdBy: req.user._id,
      read: false,
      post: req.comment.post,
      receiver: usersToNotify[i],
    });
    if (
      !existingNotifications.length &&
      `${usersToNotify[i]}` !== `${req.user._id}`
    ) {
      const notification = await Notifications.create({
        type: 'comment',
        createdBy: {
          _id: req.user._id,
          name: req.user.name,
          photo: req.user.photo,
        },
        receiver: usersToNotify[i],
        post: req.comment.post,
      });

      notification.post.club = post.club;
      req.app.io.emit(`notification ${usersToNotify[i]}`, {
        notifications: notification,
      });
      req.pushNotification = true;
    } else {
      req.pushNotification = false;
    }
  }

  next();
});

exports.puschCommentNotification = catchAsync(async (req, res, next) => {
  if (req.pushNotification) {
    const payload = JSON.stringify({
      title: `New comment`,
      content: {
        body: `${req.user.name} commented on a post you are following`,
        icon: 'https://reaflect-public.s3.eu-north-1.amazonaws.com/logo.png',
      },
      redirectData: { club: req.post.club, post: req.comment.post },
    });

    req.post.subscriptions.forEach(subscription => {
      if (req.user.subscription.endpoint !== subscription.endpoint) {
        webpush
          .sendNotification(subscription, payload)
          .catch(err => new AppError(err));
      }
    });
  }

  res.status(201).send({
    status: 'success',
    data: req.comment,
  });
});

exports.setSubscriptionOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.body.post);
  if (
    !post.subscriptions.find(
      subscription => subscription.endpoint === req.user.subscription.endpoint
    )
  ) {
    await Post.findByIdAndUpdate(
      { _id: post._id },
      {
        $addToSet: {
          subscriptions: { ...req.user.subscription, user: req.user._id },
        },
      },
      { new: true }
    );
  }

  next();
});

exports.setReadOnNotification = catchAsync(async (req, res, next) => {
  const notification = await Notifications.findByIdAndUpdate(req.params.id, {
    read: true,
  });

  console.log(notification);

  res.status(201).json({
    message: 'notification updated',
  });
});

function paginate(query, queryString) {
  const page = queryString.page * 1 || 1;
  const limit = queryString.limit * 1 || 100;
  const skip = (page - 1) * limit;

  query = query.skip(skip).limit(limit);

  return query;
}
