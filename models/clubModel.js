const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Club must have a name']
    },
    photo: {
        type:String,
        default: 'default.png'
    },
    active: {
        type: Boolean,
        default: true,
        select: false
    }
},{
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    id: false
});

clubSchema.virtual('books', {
    ref: 'Books',
    foreignField: 'club',
    localField: '_id'
});

clubSchema.virtual('members', {
    ref: 'User',
    foreignField: 'clubs',
    localField: '_id'
});

clubSchema.virtual('posts', {
    ref: 'Posts',
    foreignField: 'club',
    localField: '_id'
});

const Clubs = mongoose.model('Clubs', clubSchema);

module.exports = Clubs;