const express = require('express');
const mailjet = require('node-mailjet').connect(
  process.env.MAILJET_PUBLIC,
  process.env.MAILJET_PRIVATE
);
const catchAsync = require('../utils/catchAsync');

const router = express.Router();

router.post(
  '/',
  catchAsync(async (req, res, next) => {
    if (req.body.mail) {
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
        .then(result => {
          console.log(result.body);
          res.status(200).json('success');
        })
        .catch(err => {
          console.log(err);
          res.status(200).json('failed');
        });
    } else {
      res.status(404).json('no email');
    }
  })
);

module.exports = router;
