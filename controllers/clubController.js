const Clubs = require('../models/clubModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.setUserId = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllClubs = factory.getAll(Clubs);
exports.createClub = factory.createOne(Clubs);
exports.updateClub = factory.updateOne(Clubs);
exports.deleteClub = factory.deleteOne(Clubs);

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