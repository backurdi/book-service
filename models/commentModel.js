const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required: [true, 'Comment must have some text']
    },
    post:{
        type: mongoose.Schema.ObjectId,
        ref: 'Posts',
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
})

const Comments = mongoose.model('Comments', commentSchema);

module.exports = Comments;