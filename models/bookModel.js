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
    description:{
        type:String,
    },
    pagesTotal:{
        type:Number,
        required: [true, 'tell us number of pages']
    },
    image:String,
    club: {
        type: mongoose.Schema.ObjectId,
        ref: 'Clubs',
        required: [true, 'Book must have a club']
    },
    bookType: {
        type:String,
        enum:['book','e-book','audio']
    },
    isbn:{
        type:String,
        required: [true, 'All books has an ISBN number']
    },
    createdAt: {
        required: true,
        type: Date,
        set: Date.now,
        default: Date.now
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

bookSchema.pre(/^findByAnd/, async function (next) {
    this.r = await this.findOne();
    next();
});

// bookSchema.pre(/^find/, function (next) {
//     this.populate({
//       path: 'comments', 
//     })
  
//     next();
//   });

const Books = mongoose.model('Books', bookSchema);

module.exports = Books;