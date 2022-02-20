const catchAsync = require('./../utils/catchAsync');
const AppError = require('./../utils/appError');
const APIFeatures = require('./../utils/apiFeatures');

exports.deleteOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findOne({ _id: req.params.id }).exec();

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    const deleteResponse = await doc.deleteOne();
    res.status(204).json({
      status: 'success',
      data: deleteResponse,
    });
  });

exports.updateOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(200).json({
      status: 'success',
      data: doc,
    });
  });

exports.createOne = Model =>
  catchAsync(async (req, res, next) => {
    const doc = await Model.create(req.body);

    res.status(201).send({
      status: 'success',
      data: doc,
    });
  });

exports.getOne = (Model, popOptions) =>
  catchAsync(async (req, res, next) => {
    let query = Model.findById(req.params.id);
    if (popOptions) query = query.populate(popOptions);
    const doc = await query;

    if (!doc) {
      return next(new AppError('No document found with that ID', 404));
    }

    res.status(201).json({
      status: 'success',
      data: doc,
    });
  });

exports.getAll = Model =>
  catchAsync(async (req, res, next) => {
    //To allow for nested GET reviews on tour (hack)
    let filter = {};
    if (req.params.clubId) {
      filter = {
        club: req.params.clubId,
      };
    }

    const query = Model.find(filter).sort({ createdAt: -1 });
    if (req.query.page) {
      query.skip(req.query.page);
    }
    if (req.query.limit) {
      query.limit(+req.query.limit);
    }
    query.populate({
      path: 'user',
      model: 'User',
      select: ['name', 'photo'],
    });
    const doc = await query;

    res.status(200).json({
      status: 'success',
      result: doc.length,
      data: doc,
    });
  });
