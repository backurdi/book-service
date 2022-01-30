const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');
const {setConfigVars} = require('../utils/s3');

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

exports.setS3Config = (req, res, next)=>{
    setConfigVars('profilePic');
    req.s3FileName = 'profile';

    next()
}

exports.getMe = (req, res, next) => {
    req.params.id = req.user.id;
    next();
}
exports.updateMe = catchAsync(async (req, res, next) => {
    //1) Create error if user POSTs password data
    if (
        req.body.password ||
        req.body.passwordConfirm
    ) {
        return next(
            new AppError(
                'This route is not for password updates. Please use /updateUserPassword',
            ),
            400,
        );
    }
    //2) Filtered out unwanted field names that are not allowed to be updated
    const filteredBody = filterObj(
        req.body,
        'name',
        'email',
    );
    console.log()
    if (req.photo) filteredBody.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;

    //3) Update user document
    const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        filteredBody, {
            new: true,
            runValidators: true,
        },
    ).populate({
        path:'clubs',
        select:['name', 'photo']
    });

    res.status(200).json({
        status: 'success',
        data: {
            user: updatedUser,
        },
    });
}, );

exports.deleteMe =

    catchAsync(async (req, res, next) => {
        await User.findByIdAndUpdate(req.user.id, {
            active: false,
        });

        res.status(204).json({
            status: 'success',
            data: null
        })
    }, );

    exports.getAllUsers = factory.getAll(User);
    exports.updateUser = factory.updateOne(User);
    exports.deleteUser = factory.deleteOne(User);
    


exports.getUser = catchAsync(async (req, res, next) => {
    const query = User.findById(req.params.id).populate({
        path:'clubs',
        select:['name', 'photo']
    }).populate( {path:'invites', select:['name', 'photo']});
    const doc = await query;

    doc.photo = req.user.photo;
    
    // doc.clubs.forEach(club=>{
    //     club.photo = `${club.photo}`;
    // });

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(201).json({
        status: 'success',
        data: doc
    });
});

exports.joinClub = catchAsync(async(req, res, next)=>{
    const user = await User.findByIdAndUpdate(req.user._id,{clubs:[...req.user.clubs, req.params.clubId]},{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: user
    })
});

exports.createUser = (req, res) => {
    res.status(500).json({
        status: 'error',
        message: 'This route is not defined! Please use /signup instead'
    })
};

exports.setTeacher = catchAsync(async(req, res, next) => {
    const user = await User.findByIdAndUpdate(req.user._id, {teacher:req.body.teacher},{
        new: true,
        runValidators: true
    });

    res.status(200).json({
        status: 'success',
        data: user
    })
});

exports.getStudents = catchAsync(async(req, res, next) => {
    const students = await User.find({teacher: req.user._id}).populate({
        path:'clubs',
        select:['name', 'photo']
    });

    res.status(200).json({
        status: 'success',
        data: students
    })
})