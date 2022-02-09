const webpush = require("web-push");
const AppError = require("../utils/appError");
const catchAsync = require('../utils/catchAsync');

const User = require('./../models/userModel');
const Post = require('./../models/postModel');

const publicVapidKey = process.env.WEB_PUSH_PUBLIC_KEY;
const privateVapidKey = process.env.WEB_PUSH_PRIVATE_KEY;

webpush.setVapidDetails(
    "mailto:test@test.com",
    publicVapidKey,
    privateVapidKey
  );

exports.subscribe = catchAsync(async (req, res, next)=>{
    // Get pushSubscription object
    const subscription = req.body;
    await User.findByIdAndUpdate(req.user._id, {subscription});
  
    // Send 201 - when resource created
    res.status(201).json({});
  });

  exports.postNotification = (req, res, next)=>{
    // Create payload
    const payload = JSON.stringify({ title: "Push Test" });
  
    // Pass object into sendNotification
    webpush
      .sendNotification(req.user.subscription, payload)
      .catch(err => new AppError(err));
  }

  exports.commentNotification = catchAsync(async(req, res, next)=>{
        const post = await Post.findById(req.comment.post);
        const payload = JSON.stringify({ title: `New comment`, content: {
          body: `${req.user.name} commented on a post you are following`,
          icon: "http://image.ibb.co/frYOFd/tmlogo.png",
          actions: [
            {action: 'View', title: 'Explore this new world',
              icon: 'images/checkmark.png'},
            {action: 'close', title: 'Close notification',
              icon: 'images/xmark.png'},
          ]
        }, redirectData: {club: post.club, post: req.comment.post} });

        post.subscriptions.forEach(subscription => {
            if(req.user.subscription.endpoint !== subscription.endpoint){
                webpush
              .sendNotification(subscription, payload)
              .catch(err => new AppError(err));
            }
        });

    res.status(201).send({
        status: 'success',
        data: req.comment
    });
  });

  exports.setSubscriptionOnPost = catchAsync(async(req, res, next)=>{
    const post = await Post.findById(req.body.post);
    if(!post.subscriptions.find(subscription=>subscription.endpoint === req.user.subscription.endpoint)){
        await Post.findByIdAndUpdate(
            {_id: req.body.post}, 
        {$addToSet: {subscriptions: req.user.subscription}}, 
        {new: true})
    }

    next();
  })
  