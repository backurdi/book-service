const mongoose = require('mongoose');

const clubSchema = new mongoose.Schema({
    name:{
        type:String,
        required:[true, 'Club must have a name']
    },
    owner:{
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
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

clubSchema.pre('remove', function(next) {
    // Remove all the assignment docs that reference the removed person.
    this.model('User').remove({ $pull: { clubs: this._id, invites: this._id} });
});

const Clubs = mongoose.model('Clubs', clubSchema);

module.exports = Clubs;