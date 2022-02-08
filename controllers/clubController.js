const Clubs = require('../models/clubModel');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const {setConfigVars} = require('../utils/s3');
const AppError = require('../utils/appError');

exports.setUserId = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllClubs = factory.getAll(Clubs);
exports.deleteClub = factory.deleteOne(Clubs);
exports.updateClub = catchAsync(async (req, res, next) => {
    const bodyFields = Object.keys(req.body).filter(field=> req.body[field] !== '0' && req.body[field] !== '');
    const body = {};
    
    bodyFields.forEach(field=>{body[field] = req.body[field]});
    
    if(req.photo){
        body.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;
    }

    let populateQuery = Clubs.findByIdAndUpdate(req.params.id, body, {
        new: true,
        runValidators: true,
    });
    populateQuery = populateClub(populateQuery);

    const doc = await populateQuery

    if (!doc) {
        return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
        status: 'success',
        data: doc
    });
});

exports.setS3Config = (req, res, next)=>{
    setConfigVars('clubPicture');
    req.s3FileName = 'club';

    next()
}

exports.usersForInvite = catchAsync(async (req,res,next)=>{
    let userForInvites;
    if(req.params.clubId && req.params.clubId !== 'undefined'){
        userForInvites = await Users.find({_id: { $ne: req.user._id }, clubs: {$ne: req.params.clubId}, role:{$ne: 'Teacher'}, invites: {$ne: req.params.clubId}}).select('name photo');
    }else{
        userForInvites = await Users.find({_id: { $ne: req.user._id}, role: {$ne: 'Teacher' }}).select('name photo');
    }
    
   res.status(200).json({
       message: 'success',
       data: userForInvites
   })
});

exports.createClub = catchAsync(async (req, res, next)=>{
    const body = {};

    body.name = req.body.name;
    body.photo = `${req.protocol}://${req.headers.host}/api/v1/images/${req.photo}`;
    body.owner = req.user._id;

    const club = await Clubs.create(body);
    
    if(Array.isArray(req.body.invites)){
        req.body.invites.forEach(async (invite) => {
            await Users.updateOne({_id:invite}, { $push: { invites: club._id } }) 
        });
    }else if(req.body.invites){
        await Users.updateOne({_id:req.body.invites}, { $push: { invites: club._id } })
    }

    await Users.findByIdAndUpdate(req.user._id, { $push: { clubs: club._id } })
    

    res.status(201).json({
        message:'Success',
        data:club,
    })
});

exports.inviteUsers = catchAsync(async (req, res, next)=>{
    if(req.body.invites){
        req.body.invites.forEach(async (invite) => {
            await Users.updateOne({_id:invite}, { $push: { invites: req.params.clubId } }) 
        });
    }

    res.status(200).json({
        message: 'success'
    })
})

exports.clubInvitesAnswer = catchAsync(async (req,res,next)=>{
    const {user} = req;
    const {club, accepted} = req.body;
    let acceptedClub;

    user.invites.splice(user.invites.indexOf(club), 1);
    
    if(accepted){
        user.clubs.push(club);
        await Users.findByIdAndUpdate(user._id, {invites:user.invites, clubs: user.clubs})
        acceptedClub = await Clubs.findById(club);
    }else{
        await Users.findByIdAndUpdate(user._id, {invites:user.invites})
        acceptedClub = club;
    }

    res.status(201).json({
        message:'success',
        data:acceptedClub
    })
});

exports.getClub = catchAsync(async (req,res,next)=>{
    let populateQuery = Clubs.findById(req.params.id);
    populateQuery = populateClub(populateQuery);

    const doc = await populateQuery;

    res.status(200).json({
        status: 'success',
        data: doc,
    });
    
});

function populateClub(populateQuery){
    populateQuery = populateQuery.populate('books');
    populateQuery = populateQuery.populate({path: 'posts',
        model: 'Posts',
        options: { sort: { 'createdAt': -1 } },
        populate: {
            path:'comments',
            model:'Comments',
            populate: {
                path:'user',
                model:'User',
                select:['name', 'photo']
            },
            options: { sort: { 'createdAt': 1 } },
        },
    });
    populateQuery = populateQuery.populate({path: 'posts',
        model: 'Posts',
        options: { sort: { 'createdAt': -1 } },
        populate: {
            path:'user',
            model:'User',
            select:['name', 'photo']
        },
    });
    populateQuery = populateQuery.populate('members');

    return populateQuery;
}