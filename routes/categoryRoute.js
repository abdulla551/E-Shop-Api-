const express = require("express");
// multer steps :
//  1- multer
// const multer = require("multer");

const {param, validationResult} = require("express-validator");
// عملناها param
// not body or query
//  عشان احنا عايزين ال id
// هو اللي بنتحقق منه في جزء ال get

const {
  getCategories,
  createCategory,
  getCategory,
  updateCategory,
  deleteCategory,
  uploadCategoryImage,
  resizeImage,
} = require("../services/categoryService");

const authService = require("../services/authService");

const {
  getCategoryValidator,
  updateCategoryVAlidator,
  deleteCategoryVAlidator,
  createCategoryValidator,
} = require("../utils/validator/categoryValidator");

//  2- multer
// const upload = multer({dest: "uploads/categories"});

const subCategoriesRoute = require("./subCategoryRoute");

const router = express.Router();

router.use("/:categoryId/subcategories", subCategoriesRoute);

router
  .route("/")
  .get(getCategories)

  //  ************************** before Multer ******** *******:
  // .post(createCategoryValidator, createCategory);
  // 3-Multer
  // ******** ***************************  after Multer
  // .post(
  //   upload.single("image"),
  //   (req, res, next) => {
  //     console.log(req.file);
  //     console.log(req.body);
  //     next();
  //   },
  //   createCategoryValidator,
  //   createCategory
  // );
  // ******************************** بعد ما نقلنا المالتر ميدل وير الى السيرفيس
  .post(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    createCategoryValidator,
    createCategory
  );
// single : صورة واحدة
// image : الاسم اللي في الموديل وده هبتبعت من الكلاينت سايد

router
  .route("/:id")
  // قبل ال فاليديتور كانت كده
  // .get(getCategory)

  // بعد بقت كده :
  // .get(
  // 1-- Rules
  // هنقلهم فولدر الفالديتور في ال utils
  // عشان الريفاكتور
  // param("id").isMongoId().withMessage("Invalid Category Id"),

  // 2-MiddleWare=>catch errors from rules
  // هنقله فولدر الميدل وير عشان الريفاكتور
  // (req, res) => {
  //   const errors = validationResult(req);
  //   if (!errors.isEmpty()) {
  //     return res.status(400).json({ errors: errors.array() });
  //   }

  //   res.send({ errors: result.array() });
  // },
  // getCategory)

  // بعد الريفاكتور بقت كده
  .get(getCategoryValidator, getCategory)
  .put(
    authService.protect,
    authService.allowedTo("admin", "manager"),
    uploadCategoryImage,
    resizeImage,
    updateCategoryVAlidator,
    updateCategory
  )
  .delete(
    authService.protect,
    authService.allowedTo("admin"),
    deleteCategoryVAlidator,
    deleteCategory
  );

module.exports = router;
