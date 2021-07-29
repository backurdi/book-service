const catchAsync = require("../utils/catchAsync");
const sendEmail = require('./../utils/email');

exports.send = catchAsync(async(req, res, next)=>{
    await sendEmail({
        contact: true,
        email: req.body.email,
        name: `${req.body.firstName} ${req.body.lastName}`,
        subject: 'Readee message',
        message: req.body.message,
    });

    res.status(200).json({
        message: 'success'
    })
});