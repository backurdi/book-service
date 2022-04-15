const express = require('express');
const mailjet = require('node-mailjet').connect(
  process.env.MAILJET_PUBLIC,
  process.env.MAILJET_PRIVATE
);
const Meetings = require('../models/meetingModel');
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.post(
  '/',
  catchAsync(async (req, res, next) => {
    const emailExist = await Meetings.findOne({ mail: req.body.mail });
    if (req.body.mail && !emailExist) {
      const request = mailjet.post('send', { version: 'v3.1' }).request({
        Messages: [
          {
            From: {
              Email: 'bachir.kurdi@gmail.com',
              Name: 'Bachir',
            },
            To: [
              {
                Email: req.body.mail,
                Name: 'Bachir',
              },
            ],
            Subject: 'Welcome to the new generation of meetings',
            TemplateID: 3870214,
          },
        ],
      });
      request
        .then(async result => {
          await Meetings.create(req.body);
          res.status(200).json({
            exist: false,
            message:
              'Awsome, you will be notified when the future of meetins is here',
          });
        })
        .catch(err => {
          console.log(err);
          res.status(200).json('failed');
        });
    } else {
      res.status(200).json({
        exist: true,
        message:
          'You have already subscribed, if you have not recieved your confirmation please check your spam folder',
      });
    }
  })
);

module.exports = router;
