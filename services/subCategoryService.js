// const slugify = require("slugify");
// const asyncHandler = require("express-async-handler");

// // الموديل عادة بيكون بحرف كابتل
// const ApiError = require("../utils/apiError");
// const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");
const SubCategory = require("../models/subCategoryModel");

// غالبا موضوع النييستيد هنا فيه حاجة غلط
// لان في getlistofsubcategories
// على بوست مان مش شغالة بشكل صحيح
exports.setCategoryIdToBody = (req, res, next) => {
  // Nested Routes
  if (!req.body.category) req.body.category = req.params.categoryId;
  next();
};

// Nested route
// @route GET /api/v1/categories/:categoriesId/subcategories
// console.log(req.params);
// filter
exports.createFilterObject = (req, res, next) => {
  let filterObject = {};
  if (req.params.categoryId) filterObject = {category: req.params.categoryId};
  req.filterObject = filterObject;
  next();
};

// @desc get list of subCategory by
// @route GET /api/va/subCategories/
// access Public

// video 83 getAll Factory Handler

exports.getSubCategories = factory.getAll(SubCategory);
// asyncHandler(async (req, res) => {
//   // 1- Build query
//   const documentsCount = await SubCategory.countDocuments();
//   const apiFeatures = new ApiFeatures(SubCategory.find(), req.query)
//     .paginate(documentsCount)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();

//   // 2- execute Query
//   const {mongooseQuery, paginationResult} = apiFeatures;
//   const subCategories = await mongooseQuery;

//   // .populate("category");
//   // بترجع اسم الكاتيجوري في البوستمان
//   // بدل ما هو عبارة عن id
//   // وبنمرر ليها الحاجة اللي عايزين نعملها بوبيلوت اللي هي الكاتيجوري اللي كنا معرفينها في السكيما
//   // .populate({path: "category", select: "name -_id"});
//   // وممكن بردو نستخدم الطريقة دي عشان نسليكت الحاجة اللي هترجع
//   res.status(200).json({
//     results: subCategories.length,
//     paginationResult,
//     data: subCategories,
//   });
// });

// @desc get specific subCategory by id
// @route GET /api/va/subCategories/:id
// access Public

// video 81 get Factory Handler
exports.getSubCategory = factory.getOne(SubCategory);
// asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   const subCategory = await SubCategory.findById(id);
//   // .populate({
//   //   path: "category",
//   //   select: "name -_id",
//   // });
//   if (!subCategory) {
//     // res.status(404).json({ msg: `No category For this ${id}` });
//     return next(new ApiError(`No subCategory For this ${id}`, 404));
//   }
//   res.status(200).json({data: subCategory});
// });

//  @desc create subCategory
//  @route POST /api/v1/subcategories
// @access Private

// video 81 create Factory Handler
exports.createSubCategory = factory.createOne(SubCategory);

// asyncHandler(async (req, res) => {
//   // Nested Routes

//   const {name, category} = req.body;
//   // بنعرفها هتكون تبع انهي كاتيجوري
//   //   اللي هو الريفيرنس بتاعها يعني
//   // وافتكر ان الكاتيجوري هي عبارة عن id
//   // احنا اللي معرفينها كده في الموديل
//   const subCategory = await SubCategory.create({
//     name,
//     slug: slugify(name),
//     category,
//   });
//   res.status(201).json({data: subCategory});
// });

//  @desc Update specific subCategory
//  @route PUT /api/v1/subcategories/:id
// @access Private
// video 80 Update Factory Handler
exports.updateSubCategory = factory.updateOne(SubCategory);

// asyncHandler(async (req, res, next) => {
//   const {id} = req.params; // == req.params.id

//   const {name, category} = req.body; // == req.body.name

//   const subCategory = await SubCategory.findOneAndUpdate(
//     {_id: id},
//     {name: name, slug: slugify(name), category: category},
//     {new: true}
//   );
//   // new : true = عشان يرجع الكاتيجوري بعد ما يعملها ابديت مش قبل

//   if (!subCategory) {
//     // res.status(404).json({ msg: `No subCategory For this ${id}` });
//     return next(new ApiError(`No subCategory For this ${id}`, 404));
//   }

//   res.status(201).json({data: subCategory});
// });

//  @desc Delete specific subCategory
//  @route DELETE /api/v1/subCategories/:id
// @access Private

// video 79 Delete Factory Handler
exports.deleteSubCategory = factory.deleteOne(SubCategory);

// asyncHandler(async (req, res, next) => {
//   const {id} = req.params;
//   const subCategory = await SubCategory.findByIdAndDelete(id);
//   if (!subCategory) {
//     // res.status(404).json({ msg: `No subCategory For this ${id}` });
//     return next(new ApiError(`No subCategory For this ${id}`, 404));
//   }
//   res.status(204).send();
// });
