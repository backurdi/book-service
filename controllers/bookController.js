const Books = require('../models/bookModel');
const factory = require('./handlerFactory');
// test comment

exports.setUserId = (req, res, next) => {
    if (!req.body.user) req.body.user = req.user.id;

    next();
}

exports.getAllBooks = factory.getAll(Books);
exports.getBook = factory.getOne(Books);
exports.createBook = factory.createOne(Books);
exports.updateBook = factory.updateOne(Books);
exports.deleteBook = factory.deleteOne(Books);