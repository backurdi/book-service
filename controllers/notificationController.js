/* eslint-disable no-use-before-define */
/* eslint-disable no-await-in-loop */
const webpush = require('web-push');
const AppError = require('../utils/appError');
const catchAsync = require('../utils/catchAsync');

const User = require('./../models/userModel');
const Post = require('./../models/postModel');
const Club = require('./../models/clubModel');
const Notifications = require('../models/notificationModel');

const publicVapidKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateVapidKey = process.env.WEB_PUSH_PRIVATE_KEY;

webpush.setVapidDetails(
  'mailto:test@test.com',
  publicVapidKey,
  privateVapidKey
);

exports.subscribe = catchAsync(async (req, res, next) => {
  const user = User.findById(req.user._id);
  if (
    user.subscriptions &&
    user.subscriptions.find(
      subscription => subscription.endpoint === req.body.endpoint
    )
  ) {
    await User.findOneAndUpdate(
      { _id: req.user._id },
      { $push: { subscriptions: req.body } }
    );
  } else {
    await User.findByIdAndUpdate(req.user._id, {
      subscriptions: [req.body],
    });
  }

  res.status(201).json({});
});

exports.postPushNotification = (req, res, next) => {
  // Create payload
  const payload = JSON.stringify({ title: 'Push Test' });

  // Pass object into sendNotification
  webpush
    .sendNotification(req.user.subscriptions, payload)
    .catch(err => new AppError(err));
};

exports.getNotifications = catchAsync(async (req, res, next) => {
  let notificationsQuery = Notifications.find({
    receiver: req.user._id,
  }).sort({ createdAt: -1 });

  notificationsQuery = paginate(notificationsQuery, req.query);

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
        club: post.club,
      });

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
exports.postNotification = catchAsync(async (req, res, next) => {
  const club = await Club.findById(req.body.club);
  req.club = club;
  const usersToNotify = club.subscriptions.map(
    subscription => subscription.user
  );

  for (let i = 0; i < usersToNotify.length; i += 1) {
    const existingNotifications = await Notifications.find({
      createdBy: req.user._id,
      read: false,
      club: club._id,
      receiver: usersToNotify[i],
    });
    if (
      !existingNotifications.length &&
      `${usersToNotify[i]}` !== `${req.user._id}`
    ) {
      const notification = await Notifications.create({
        type: 'post',
        createdBy: {
          _id: req.user._id,
          name: req.user.name,
          photo: req.user.photo,
        },
        isAssignment: req.post.isAssignment,
        receiver: usersToNotify[i],
        club: club._id,
        post: req.post._id,
      });

      req.app.io.emit(`notification ${usersToNotify[i]}`, {
        notifications: notification,
      });
      pushPostNotification(req.user, req.post, req.club);
    }
  }
  res.status(201).send({
    status: 'success',
    data: req.post,
  });
});

exports.pushCommentNotification = catchAsync(async (req, res, next) => {
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
      if (req.user.subscriptions.endpoint !== subscription.endpoint) {
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

const pushPostNotification = catchAsync(async (user, post, club) => {
  const payload = JSON.stringify({
    title: `New post`,
    content: {
      body: `${user.name} has posted in a club you are part of`,
      icon: 'https://reaflect-public.s3.eu-north-1.amazonaws.com/logo.png',
    },
    redirectData: { club: post.club, post: post._id },
  });
  club.subscriptions.forEach(subscription => {
    if (
      !user.subscriptions.find(
        userSubscription => userSubscription.endpoint === subscription.endpoint
      )
    ) {
      webpush
        .sendNotification(subscription, payload)
        .catch(err => new AppError(err));
    }
  });
});

exports.setSubscriptionOnPost = catchAsync(async (req, res, next) => {
  const post = await Post.findById(req.body.post);
  if (
    !post.subscriptions.find(
      subscription => subscription.endpoint === req.user.subscriptions.endpoint
    )
  ) {
    await Post.findByIdAndUpdate(
      { _id: post._id },
      {
        $addToSet: {
          subscriptions: { ...req.user.subscriptions, user: req.user._id },
        },
      },
      { new: true }
    );
  }

  next();
});

exports.setSubscriptionOnClub = catchAsync(async (req, res, next) => {
  const id = req.body.club || req.club._id;
  const club = await Club.findById(id);
  if (
    !club.subscriptions?.find(subscription =>
      req.user.subscriptions.includes(subscription?.endpoint)
    )
  ) {
    for (let i = 0; i < req.user.subscriptions.length; i++) {
      await Club.findByIdAndUpdate(
        { _id: club._id },
        {
          $addToSet: {
            subscriptions: {
              endpoint: req.user.subscriptions[i].endpoint,
              keys: req.user.subscriptions[i].keys,
              expirationTime: req.user.subscriptions[i].expirationTime,
              user: req.user._id,
            },
          },
        },
        { new: true }
      );
    }
  }

  res.status(201).json({
    message: 'Success',
    data: req.club,
  });
});

exports.setReadOnNotification = catchAsync(async (req, res, next) => {
  const notification = await Notifications.findByIdAndUpdate(req.params.id, {
    read: true,
  });

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
