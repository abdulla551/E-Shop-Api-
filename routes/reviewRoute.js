const express = require("express");

// const {param, validationResult} = require("express-validator");

const {
  createReviewValidator,
  getReviewValidator,
  updateReviewVAlidator,
  deleteReviewVAlidator,
} = require("../utils/validator/reviewValidator");

const {
  getReview,
  getReviews,
  createReview,
  updateReview,
  deleteReview,
  createFilterObject,
  setProductIdAndUserIdToBody,
} = require("../services/reviewService");

const authService = require("../services/authService");

const router = express.Router({mergeParams: true});

router
  .route("/")
  .get(createFilterObject, getReviews)
  .post(
    authService.protect,
    authService.allowedTo("user"),
    setProductIdAndUserIdToBody,
    createReviewValidator,
    createReview,
  );

router
  .route("/:id")

  .get(getReviewValidator, getReview)

  .put(
    authService.protect,
    authService.allowedTo("user"),
    updateReviewVAlidator,
    updateReview,
  )
  .delete(
    authService.protect,
    authService.allowedTo("user", "admin", "manager"),
    deleteReviewVAlidator,
    deleteReview,
  );

module.exports = router;
