const Clubs = require('../models/clubModel');
const Users = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');
const {setConfigVars} = require('../utils/s3');

exports.setUserId = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllClubs = factory.getAll(Clubs);
exports.updateClub = factory.updateOne(Clubs);
exports.deleteClub = factory.deleteOne(Clubs);

exports.setS3Config = (req, res, next)=>{
    setConfigVars('clubPicture');
    req.s3FileName = 'club';

    next()
}

exports.usersForInvite = catchAsync(async (req,res,next)=>{
    const userForInvites = await Users.find({_id: { $ne: req.user._id }, clubs: {$ne: req.params.clubId}, invites: {$ne: req.params.clubId}}).select('name photo');
    
   res.status(200).json({
       message: 'success',
       data: userForInvites
   })
});

exports.createClub = catchAsync(async (req, res, next)=>{
    const body = {};

    body.name = req.body.name;
    body.photo = `https://readee-club-pictures.s3.eu-north-1.amazonaws.com/${req.photo}`;
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
        acceptedClub = club;
    }



    res.status(201).json({
        message:'success',
        data:acceptedClub
    })
});

exports.getClub = catchAsync(async (req,res,next)=>{
    let query = Clubs.findById(req.params.id);
    query = query.populate('books');
    query = query.populate({path: 'posts',
        model: 'Posts',
        options: { sort: { 'createdAt': -1 } },
        populate: {
            path:'comments',
            model:'Comments',
            options: { sort: { 'createdAt': -1 } },
        }
    });
    query = query.populate('members');

    const doc = await query;

    res.status(201).json({
        status: 'success',
        data: doc,
    });
    
});