const dotenv = require('dotenv');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs')

dotenv.config({
    path: './config.env'
});

let bucketName;
let region;
let accessKeyId;
let secretAccessKey;

let s3;

exports.uploadFile = (file) => {
    const fileStream = fs.createReadStream(file.path)

    const uploadParams = {
        Bucket: bucketName,
        Body: fileStream,
        Key: file.filename
    }

    return s3.upload(uploadParams).promise()
}

exports.getFileStream = (fileKey) => {
    const downloadParams = {
      Key: fileKey,
      Bucket: bucketName
    }
  
    return s3.getObject(downloadParams);
}

exports.setConfigVars = (configType) =>{
    switch (configType) {
        case 'profilePic':
            bucketName = process.env.AWS_PROFILE_BUCKET_NAME;
            region = process.env.AWS_PROFILE_BUCKET_REGION;
            accessKeyId = process.env.AWS_PROFILE_ACCESS_KEY;
            secretAccessKey = process.env.AWS_PROFILE_ACCESS_SECRET_KEY;
            break;
        case 'clubPicture':
            bucketName = process.env.AWS_CLUB_BUCKET_NAME;
            region = process.env.AWS_CLUB_BUCKET_REGION;
            accessKeyId = process.env.AWS_CLUB_ACCESS_KEY;
            secretAccessKey = process.env.AWS_CLUB_ACCESS_SECRET_KEY;
            break;
        default:
            break;
    }

    s3 = new S3({
        region,
        accessKeyId,
        secretAccessKey
    })
}