const mongoose = require('mongoose');
const Comments = require('./commentModel');

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
        required: true,
        type: Date,
        set: Date.now,
        default: Date.now
    },
    subscriptions:[{
        endpoint: { type: String, unique: true, required: false },
        expirationTime: { type: Number, required: false },
        keys: {
          auth: String,
          p256dh: String,
        },
    }]
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

postSchema.post('deleteOne', { document: true, query: false }, async function() {
    await Comments.remove({post:this._id});
  
    
  });


const Posts = mongoose.model('Posts', postSchema);

module.exports = Posts;