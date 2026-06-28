// const slugify = require("slugify");
// const ApiError = require("../utils/apiError");
// const ApiFeatures = require("../utils/apiFeatures");
const asyncHandler = require("express-async-handler");
const {v4: uuid4} = require("uuid"); //to generate unique id
const sharp = require("sharp");
const factory = require("./handlersFactory");
const Brand = require("../models/brandModel");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware");

// upload single processing
exports.uploadBrandImage = uploadSingleImage("image");
// -------------------
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  console.log(req.file); //: المرادي هتلاقي بروبيرتي اسمها بافر عكس ال ديسك ستورج
  const filename = `brand-${uuid4()}-${Date.now()}.jpeg`;
  await sharp(req.file.buffer)
    // شارب بتاخد بافر يبقى اكيد لازم نستخدم ميموري ستوريدج
    .resize(600, 600) //width+ height
    .toFormat("jpeg")
    .jpeg({quality: 90})
    .toFile(`uploads/brands/${filename}`); // مكان الحفظ
  // كده هتتحفظ في الديسك ستوريدج

  // -------

  // هنضيف بروبيرتي اسمها ايمج في البودي
  // عشان في السيرفيس اللي اسمها كرييت .. كان بيتبعتلها
  // كل الحاجات اللي في البودي .. ف احنا هنزود الصورة عشان تتحفظ في الداتا بيز لما نعمل كرييت
  req.body.image = filename; // save image into DB

  next();
});

// @desc Get list of Brands
// @route GET /api/v1/Brands
// @access Public

// video 83 getAll Factory Handler
exports.getBrands = factory.getAll(Brand);

//  asyncHandler(async (req, res) => {
//   // 1- Build query
//   const documentsCount = await Brand.countDocuments();
//   const apiFeatures = new ApiFeatures(Brand.find(), req.query)
//     .paginate(documentsCount)
//     .filter()
//     .search()
//     .limitFields()
//     .sort();

//   // 2- execute Query
//   const {mongooseQuery, paginationResult} = apiFeatures;
//   const brands = await mongooseQuery;

//   res
//     .status(200)
//     .json({results: brands.length, paginationResult, data: brands});
// });

// @desc get specific brand by id
// @route GET /api/va/brands/:id
// access Public

// الجزء ده قبل اضافة كلاس ال appError
// exports.getBrand = asyncHandler(async (req, res) => {
//   const id = req.params.id;
//   console.log("id:::::", id);
//   const brand = await brand.findById(id);
//   if (!brand) {
//     res.status(404).json({ msg: `No brand For this ${id}` });
//   }
//   res.status(200).json({ data: brand });
// });

//  هو هو بس باضافة ال appError
// قارن بينهم وشوف الفرق
// هعمل الحوار ده هنا بس ... الباقي هعدل على طول

// video 81 get Factory Handler
exports.getBrand = factory.getOne(Brand);

//  asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   const brand = await Brand.findById(id);
//   if (!brand) {
//     // res.status(404).json({ msg: `No category For this ${id}` });
//     return next(new ApiError(`No brand For this ${id}`, 404));
//   }
//   res.status(200).json({data: brand});
// });

//  @desc create brand
//  @route POST /api/v1/brands
// @access Private

// video 81 create Factory Handler
exports.createBrand = factory.createOne(Brand);

// asyncHandler(async (req, res) => {
//   const name = req.body.name;

//   const brand = await Brand.create({name, slug: slugify(name)});
//   res.status(201).json({data: brand});
// الطريقة القديمة
// const newBrand = new BrandModel({ name });
// newBrand
//   .save()
//   .then((doc) => {
//     res.json(doc);
//   })
//   .catch((err) => {
//     res.json(err);
//   });
// });

//  @desc Update specific brand
//  @route PUT /api/v1/brands/:id
// @access Private

// Middleware :
// الجزء ده هنعمله عشان شيلنا ال slug
// لما عملنا ريفاكتور في فيديو79
// او ممكن المديل وير اللي عملتها هناك
// في الفالديتور
// exports.applySlugify = (req, res, next) => {
//   req.body.slug = slugify(req.body.name);
//   next();
// };
// وبعدين نستدعيها في الراوتس قبل الراوتر

// video 80 Update Factory Handler
exports.updateBrand = factory.updateOne(Brand);
//  asyncHandler(async (req, res, next) => {
//   const brand = await Brand.findByIdAndUpdate(req.params.id, req.body, {
//     new: true,
//   });
//   // new : true = عشان يرجع الكاتيجوري بعد ما يعملها ابديت مش قبل

//   if (!brand) {
//     // res.status(404).json({ msg: `No category For this ${id}` });
//     return next(new ApiError(`No category For this ${req.params.id}`, 404));
//   }

//   res.status(201).json({data: brand});
// });

//  @desc Delete specific Brand
//  @route DELETE /api/v1/brands/:id
// @access Private

// video 79 Delete Factory Handler
exports.deleteBrand = factory.deleteOne(Brand);

// asyncHandler(async (req, res, next) => {
//   const {id} = req.params;
//   const brand = await Brand.findByIdAndDelete(id);
//   if (!brand) {
//     // res.status(404).json({ msg: `No brand For this ${id}` });
//     return next(new ApiError(`No brand For this ${id}`, 404));
//   }
//   res.status(204).send();
// });
