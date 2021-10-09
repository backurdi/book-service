const mongoose = require('mongoose');

const postSchema = new mongoose.Schema({
    text:{
        type:String,
        required:[true, 'post must have some text']
    },
    pagesFrom:Number,
    pagesTo:Number,
    book:{
        type: mongoose.Schema.ObjectId,
        ref: 'Books',
    },
    club:{
        type: mongoose.Schema.ObjectId,
        ref: 'Clubs',
    },
    user:{
        type: mongoose.Schema.ObjectId,
        ref: 'Users',
        required:[true, 'comment must have a user']
    },
    photo: String,
    createdAt: {
        type: Date,
        default: Date.now(),
    },
},{
    toJSON: {
        virtuals: true,
    },
    toObject: {
        virtuals: true,
    },
    id: false
});

postSchema.virtual('comments', {
    ref: 'Comments',
    foreignField: 'post',
    localField: '_id'
});


const Posts = mongoose.model('Posts', postSchema);

module.exports = Posts;