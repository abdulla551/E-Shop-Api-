const express = require("express");

const {param, validationResult} = require("express-validator");
const authService = require("../services/authService");
const {
  getBrands,
  createBrand,
  getBrand,
  updateBrand,
  deleteBrand,
  uploadBrandImage,
  resizeImage,
} = require("../services/brandService");
const {
  getBrandValidator,
  updateBrandVAlidator,
  deleteBrandVAlidator,
  createBrandValidator,
} = require("../utils/validator/brandValidator");

const router = express.Router();

router
  .route("/")
  .get(getBrands)
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    createBrandValidator,
    createBrand
  );

router
  .route("/:id")

  // بعد الريفاكتور بقت كده
  .get(getBrandValidator, getBrand)

  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadBrandImage,
    resizeImage,
    updateBrandVAlidator,
    updateBrand
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteBrandVAlidator,
    deleteBrand
  );

module.exports = router;
