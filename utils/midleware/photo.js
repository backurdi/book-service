const multer = require('multer');
const sharp = require('sharp');
const util = require('util');
const fs = require('fs');
const {uploadFile} = require('../s3');

const catchAsync = require('../catchAsync');
const AppError = require('../appError');

const unlinkFile = util.promisify(fs.unlink);

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

exports.uploadPhoto = upload.single('photo');

exports.resizePhoto = catchAsync(async (req, res, next) => {
    if (!req.file) return next();
    console.log(req.originalUrl);

    req.file.filename = `${req.originalUrl.split('/').pop()}-${req.user.id}-${Date.now()}.jpeg`;
    req.file.path = `public/img/${req.file.filename}`;

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

    req.photo = `${result.Key}`;

    next();
});