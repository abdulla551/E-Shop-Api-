// final shape for category Service
const multer = require("multer");
const sharp = require("sharp"); //for resize image
const {v4: uuid4} = require("uuid"); //to generate unique id

const factory = require("./handlersFactory");
const Category = require("../models/categoryModel");
const ApiError = require("../utils/apiError");
const asyncHandler = require("express-async-handler");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware");

//1-  Disk Storage engine : محطوطين في كومنت عشان احتاجنا اننا نشتغل على الميموري ستورج تحت
// const multerStorage = multer.diskStorage({
//   destination: function (req, file, cb) {
//     // cb زي النيكست في اكسبريس لو عندي اخطاء اعمل كذا لو معنديش خش على اللي بعده او اعمل كذا
//     // هنا مثلا معنديش اخطاء ف بقوله ان الديست هيكون كذا
//     cb(null, "uploads/categories");
//   },
//   filename: function (req, file, cb) {
//     // هنخلي الصور تكون يونيك ومش مكررة
//     // ممكن نفترض فورم معين للفايل او الصورة
//     // category-${id}-Date.now().jpeg
//     const extension = file.mimetype.split("/")[1];
//     // هنعرف الفايل بنفس الفورمات اللي فوق
//     const filename = `category-${uuid4()}-${Date.now()}.${extension}`;
//     cb(null, filename);
// console.log("BBBBBBBBBOOO:", file);
//   },
// });
// -----------------------------------------------------------
// 2- memory storage engine
// احنا هنشتغل بالطريقة دي
// بس هننقلها في فايل منفصل عشان هسنتخدمها تاني في
// البراند و البروداكت
// عشان كده هعملها كومنت
// اللي هو الجزء اللي بين الشرطتين
// -------------- (1)

// const multerStorage = multer.memoryStorage();
// const multerFilter = function (req, file, cb) {
//   // ال miimetype
//   // بتيجي بالشكل ده
//   // image/jpeg (شوف كونسول "BBBBBBBBBOOO"  عشان تتاكد)
//   if (file.mimetype.startsWith("image")) {
//     cb(null, true);
//   } else {
//     cb(new ApiError("Only Images Allowed", 400), false);
//   }
// };
// MUlter Middleware
// const upload = multer({storage: multerStorage, fileFilter: multerFilter});
// exports.uploadCategoryImage = upload.single("image");
// معناها
// استقبل ملف واحد فقط.
// اسم الـ field في الـ form أو Postman لازم يكون "image".

// -------------(2)
// بعد ما عملنا فايل منفصل في المديلويرز هيكون الشكل كده بس
exports.uploadCategoryImage = uploadSingleImage("image");
// -------------------
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  console.log(req.file); //: المرادي هتلاقي بروبيرتي اسمها بافر عكس ال ديسك ستورج
  const filename = `category-${uuid4()}-${Date.now()}.jpeg`;

  if (req.file) {
    await sharp(req.file.buffer)
      // شارب بتاخد بافر يبقى اكيد لازم نستخدم ميموري ستوريدج
      .resize(600, 600) //width+ height
      .toFormat("jpeg")
      .jpeg({quality: 90})
      .toFile(`uploads/categories/${filename}`); // مكان الحفظ
    // كده هتتحفظ في الديسك ستوريدج

    // -------

    // هنضيف بروبيرتي اسمها ايمج في البودي
    // عشان في السيرفيس اللي اسمها كرييت .. كان بيتبعتلها
    // كل الحاجات اللي في البودي .. ف احنا هنزود الصورة عشان تتحفظ في الداتا بيز لما نعمل كرييت
    req.body.image = filename; // save image into DB
  }

  next();
});

//-------------------------------------------------------------------------------------------------

// @desc    Get list of categories
// @route   GET /api/v1/categories
// @access  Public

// Build query
exports.getCategories = factory.getAll(Category);

// @desc    Get specific category by id
// @route   GET /api/v1/categories/:id
// @access  Public
exports.getCategory = factory.getOne(Category);

// @desc    Create category
// @route   POST  /api/v1/categories
// @access  Private
exports.createCategory = factory.createOne(Category);

// @desc    Update specific category
// @route   PUT /api/v1/categories/:id
// @access  Private
exports.updateCategory = factory.updateOne(Category);

// @desc    Delete specific category
// @route   DELETE /api/v1/categories/:id
// @access  Private
exports.deleteCategory = factory.deleteOne(Category);
