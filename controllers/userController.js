const multer = require('multer');
const sharp = require('sharp');
const util = require('util');
const fs = require('fs');
const {uploadFile, getFileStream} = require('../utils/s3');

const unlinkFile = util.promisify(fs.unlink)

const User = require('./../models/userModel');
const catchAsync = require('../utils/catchAsync');
const AppError = require('../utils/appError');
const factory = require('./handlerFactory');

const multerStorage = multer.memoryStorage();

const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
        cb(null, true);
    } else {
        cb(new AppError('Not an image! Please upload only images.', 400), false);
    }
};

const upload = multer({
    storage: multerStorage,
    fileFilter: multerFilter
});

exports.uploadUserPhoto = upload.single('photo');

exports.resizeUserPhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();

    req.file.filename = `user-${req.user.id}-${Date.now()}.jpeg`;
    req.file.path = `public/img/users/${req.file.filename}`;

    await sharp(req.file.buffer)
    .resize(500, 500)
    .toFormat('jpeg')
    .jpeg({
        quality: 90
    })
    .toFile(req.file.path);
    
    next();
});

exports.uploadToS3 = catchAsync(async(req, res, next) =>{
    const result = await uploadFile(req.file);
    await unlinkFile(req.file.path);

    req.imagePath = `${result.Key}`;

    next();
});

const filterObj = (obj, ...allowedFields) => {
    const newObj = {};
    Object.keys(obj).forEach(el => {
        if (allowedFields.includes(el)) newObj[el] = obj[el];
    });

    return newObj;
};

// exports.getProfilePictureFromS3 = catchAsync(async(req, res, next)=>{
//     const key = req.user.photo;
    
//     console.log(readStream);

//     req.user.photo = readStream

//     next();
// });

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
    if (req.imagePath) filteredBody.photo = `https://readee-profile-pictures.s3.eu-north-1.amazonaws.com/${req.imagePath}`;

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
    });
    const doc = await query;
    // const photo = await getFileStream(req.user.photo);
    doc.photo = req.user.photo;

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