const factory = require("./handlersFactory");
const Review = require("../models/reviewModel");

// Nested route
//  GET /api/v1/products/:productId/reviews
// console.log(req.params);
// filter
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.productId) filterObject = {product: req.params.productId};
  req.filterObject = filterObject;
  next();
};

// @desc Get list of reviews
// @route GET /api/v1/reviews
// @access Public
exports.getReviews = factory.getAll(Review);

// @desc get specific review by id
// @route GET /api/va/reviews/:id
// access Public

exports.getReview = factory.getOne(Review);

// nested Route
exports.setProductIdAndUserIdToBody = (req, res, next) => {
  // Nested Routes
  if (!req.body.product) req.body.product = req.params.productId;
  if (!req.body.user) req.body.user = req.user._id;
  next();
};
//  @desc create Review
//  @route POST /api/v1/reviews
// @access Private/protect/user(role)
exports.createReview = factory.createOne(Review);

//  @desc Update specific review
//  @route PUT /api/v1/reviews/:id
// @access Private/protect/user(role)
exports.updateReview = factory.updateOne(Review);

//  @desc Delete specific review
//  @route DELETE /api/v1/reviews/:id
// @access Private/protect/user-Admin-manager
exports.deleteReview = factory.deleteOne(Review);
