const express = require("express");

const {
  createSubCategory,
  getSubCategories,
  getSubCategory,
  updateSubCategory,
  deleteSubCategory,
  setCategoryIdToBody,
  createFilterObject,
} = require("../services/subCategoryService");

const authService = require("../services/authService");

const {
  createSubCategoryValidator,
  getSubCategoryValidator,
  updateSubCategoryVAlidator,
  deleteSubCategoryVAlidator,
} = require("../utils/validator/subCategoryValidator");

const router = express.Router({mergeParams: true});
// mergeParams:true : ِAllow access parameters on other Routers
// بتخلينا ناكسس البارامز اللي في راوتس تانية في حالتنا الكاتيجوريز الرئيسية هنا
// we need to access categoryId from category router despite we are in subcategories
router
  .route("/")
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    setCategoryIdToBody,
    createSubCategoryValidator,
    createSubCategory
  )
  .get(createFilterObject, getSubCategories);

router
  .route("/:id")
  .get(getSubCategoryValidator, getSubCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    updateSubCategoryVAlidator,
    updateSubCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteSubCategoryVAlidator,
    deleteSubCategory
  );
module.exports = router;
