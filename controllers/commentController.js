const Comments = require('../models/commentModel');
const Books = require('../models/bookModel');
const catchAsync = require('../utils/catchAsync');

exports.addComment = catchAsync(async (req, res, next)=>{
    const comment = await Comments.create(req.body);
    const book = await Books.findById(req.body.bookId);

    const updatedBook = await Books.findByIdAndUpdate(req.body.bookId, {comments:[...book.comments, comment.id]},{
        new: true,
        runValidators: true
    })

    res.status(201).json({
        message: 'successfull',
        data: updatedBook
    })
});

exports.deleteComment = catchAsync(async (req, res, next)=>{
    const comment = await Comments.findById(req.params.id);
    const book = await Books.findById(comment.bookId);

    book.comments.splice(book.comments.indexOf(book.comments.find(comment => comment.id === req.body)), 1);

    await Books.findByIdAndUpdate(comment.bookId, {comments:book.comments});
    await Comments.findByIdAndDelete(req.params.id);

    res.status(201).json({
        message: 'successfull',
    })
});

exports.updateComment = catchAsync(async (req, res, next)=>{
    const comment = await Comments.findByIdAndUpdate(req.params.id, req.body,{
        new: true,
        runValidators: true
    });

    res.status(201).json({
        message: 'successfull',
        data: comment
    })
});