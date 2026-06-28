// @desc : this file combine Rules + validator middleware for each route

const {check, body} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const Review = require("../../models/reviewModel");

exports.createReviewValidator = [
  check("title").optional(),
  check("ratings")
    .notEmpty()
    .withMessage("ratings Value Required")
    .isFloat({min: 1, max: 5})
    .withMessage("Ratings value must be between 1 to 5"),
  check("user").isMongoId().withMessage("Invalid Review id Format "),
  check("product")
    .isMongoId()
    .withMessage("Invalid Review id Format ")
    .custom((val, {req}) =>
      //check if logged user create review before
      Review.findOne({user: req.user._id, product: req.body.product}).then(
        (review) => {
          if (review) {
            return Promise.reject(
              new Error("you already created a review before"),
            );
          }
        },
      ),
    ),

  validatorMiddleWare,
];

exports.getReviewValidator = [
  check("id").isMongoId().withMessage("Invalid Review id Format "),
  validatorMiddleWare,
];

exports.updateReviewVAlidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id Format ")
    .custom((val, {req}) =>
      // Check review ownership before update
      Review.findById(val).then((review) => {
        if (!review) {
          return Promise.reject(new Error(`there is no review with id ${val}`));
        }
        if (review.user._id.toString() !== req.user._id.toString()) {
          return Promise.reject(
            new Error("you are not allowed to perform this action"),
          );
        }
      }),
    ),

  validatorMiddleWare,
];

exports.deleteReviewVAlidator = [
  check("id")
    .isMongoId()
    .withMessage("Invalid Review id Format ")
    .custom((val, {req}) => {
      if (req.user.role === "user") {
        return Review.findById(val).then((review) => {
          if (!review) {
            return Promise.reject(
              new Error(`there is no review with id ${val}`),
            );
          }
          if (review.user._id.toString() !== req.user._id.toString()) {
            return Promise.reject(
              new Error("You are not allowed to delete this review"),
            );
          }
        });
      }
      return true;
    }),
  validatorMiddleWare,
];
