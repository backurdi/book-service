const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title:{
        type:String,
        required: [true, 'A book needs a title']
    },
    pagesRead:{
        type:Number,
        default: 0
    },
    pagesTotal:{
        type:Number,
        required: [true, 'tell us number of pages']
    },
    user:{
        type:String,
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required:[true, 'A book must be assigned to a user']
    },
    isCurrent:{
        type:Boolean,
        default:false
    },
    image:String,
    bookType: {
        type:String,
        enum:['BOOK','e-book','audio']
    },
    isbn:{
        type:String,
        required: [true, 'All books has an ISBN number']
    },
    comments:[{
        type: mongoose.Schema.ObjectId,
        ref: 'Comments',
    }, ],
});

bookSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'comments',
    });

    next();
});

bookSchema.pre(/^find/, function (next) {
    this.populate({
        path: 'user', 
    });

    next();
});

const Books = mongoose.model('Books', bookSchema);

module.exports = Books;