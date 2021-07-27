const mongoose = require('mongoose');

const commentSchema = new mongoose.Schema({
    text:{
        type:String,
        required: [true, 'Comment must have some text']
    },
    pagesFrom:Number,
    pagesTo:Number,
    bookId:{
        type:String,
        required: [true, 'Comment should be on a book']
    }

})

const Comments = mongoose.model('Comments', commentSchema);

module.exports = Comments;