const Books = require('../models/bookModel');
const Comments = require('../models/commentModel');
const catchAsync = require('../utils/catchAsync');
const factory = require('./handlerFactory');

exports.getAllBooks = factory.getAll(Books);
exports.getBook = factory.getOne(Books);
exports.createBook = factory.createOne(Books);
exports.updateBook = factory.updateOne(Books);

exports.createBook = factory.createOne(Books);

exports.createBook = catchAsync(async (req, res, next) => {

    const book = await Books.create({...req.body, user:req.user._id});

    res.status(201).send({
        status: 'success',
        data: book
    });
});

exports.deleteBook = catchAsync(async(req,res,next)=>{
    const book = await Books.findById(req.params.id);

    for(let i = 0; i<book.comments.length; i++){
        await Comments.findByIdAndDelete(book.comments[i]._id)
    }

    await Books.findByIdAndDelete(req.params.id);

    res.status(204).json({
        status: 'success',
        data: null
    });
});