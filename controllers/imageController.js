const catchAsync = require("../utils/catchAsync");
const {getFileStream, setConfigVars} = require('./../utils/s3');

exports.setS3Config = (req, res, next)=>{
    const {key} = req.params
    if(key.includes('club')){
        setConfigVars('clubPicture');
    }else if(key.includes('profile')){
        setConfigVars('profilePic');
    }else if(key.includes('post')){
        setConfigVars('postPicture');
    }
    req.s3FileName = 'club';

    next()
}

exports.getImage = catchAsync(async(req, res, next)=>{
    const {key} = req.params
    const readStream = getFileStream(key)
      
        readStream.pipe(res)
});