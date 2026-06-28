const express = require("express");

const {param, validationResult} = require("express-validator");
// عملناها param
// not body or query
//  عشان احنا عايزين ال id
// هو اللي بنتحقق منه في جزء ال get

const {
  createProduct,
  getProduct,
  updateProduct,
  deleteProduct,
  getProducts,
  uploadProductImages,
  resizeProductImages,
} = require("../services/productService");

const authService = require("../services/authService");

const reviewsRoute = require("./reviewRoute");

const {
  createProductValidator,
  getProductValidator,
  updateProductValidator,
  deleteProductValidator,
} = require("../utils/validator/productValidator");

const subCategoriesRoute = require("./subCategoryRoute");

const router = express.Router();

// POST /products/234234234/reviews (انقلني على الريفير راوت)
// GET /products/234234234/reviews
// GET /products/234234234/reviews/1110224
// بنجيب ريفيو معين على البرودكت المعين
router.use("/:productId/reviews", reviewsRoute);

router.use("/:categoryId/subcategories", subCategoriesRoute);

router
  .route("/")
  .get(getProducts)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    createProductValidator,
    createProduct,
  );

router
  .route("/:id")
  .get(getProductValidator, getProduct)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadProductImages,
    resizeProductImages,
    updateProductValidator,
    updateProduct,
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteProductValidator,
    deleteProduct,
  );

module.exports = router;
