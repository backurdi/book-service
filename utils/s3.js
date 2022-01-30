const dotenv = require('dotenv');
const S3 = require('aws-sdk/clients/s3');
const fs = require('fs')

dotenv.config({
    path: './config.env'
});

const region = process.env.AWS_BUCKET_REGION;;
const accessKeyId = process.env.AWS_ACCESS_KEY;;
const secretAccessKey = process.env.AWS_ACCESS_SECRET_KEY;

const s3 = new S3({
    region,
    accessKeyId,
    secretAccessKey
});

let bucketName;

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
  
    return s3.getObject(downloadParams).createReadStream();
}

// Remove this function and add the bucketName to the req
exports.setConfigVars = (configType) =>{
    switch (configType) {
        case 'profilePic':
            bucketName = process.env.AWS_PROFILE_BUCKET_NAME;
            break;
        case 'clubPicture':
            bucketName = process.env.AWS_CLUB_BUCKET_NAME;
            break;
        case 'postPicture':
            bucketName = process.env.AWS_POST_BUCKET_NAME;
            break;
        default:
            break;
    }
}