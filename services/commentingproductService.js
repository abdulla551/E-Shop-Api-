//  الفايل ده قبل ال ريفاكتورينج لل APIFEATURES
// هعمله كومنت واكرره عشان وانا بذاكر
// اللي جنبها دوبل سلاش يعني قبل الريفاكتورينج مكانتش كومنت على عكس اللي جنبها اربعة

const slugify = require("slugify");
const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Product = require("../models/ProductModel");

// @desc Get list of Products
// @route GET /api/v1/products
// @access Public

// بعد فيديو 71  كان في كومنتس كتير ف هعمل الجزء ده كله كومنت وهكتبه تاني تحت
// exports.getProducts = asyncHandler(async (req, res) => {
//   // 1- Filtering
//   const queryStringObj = {...req.query};
//   const excludesFields = ["page", "sort", "limit", "fields"];
//   excludesFields.forEach((field) => delete queryStringObj[field]);

//   // 2- pagination
//   const page = req.query.page * 1 || 1;
//   const limit = req.query.limit * 1 || 5;
//   const skip = (page - 1) * limit;
//   // جزء ال فلتر ممكن بطريقتين اللي في الكومنت واللي تحتها
//   // const products = await Product.find({
//   // price: req.query.price
//   // ratingsAverage: req.query.ratingsAverage
//   // })
//   //  او بالطريقة دي
//   // const products = await Product.find(req.query)

//   // هي الخطوات اللي جاية دي صح ولكن هنعدلها عشان تكون احسن من ناحية التنظيم
//   // بدل ما هي معمول لل كويري اكسيكيوت على طول
//   // هن بيلد الكويري وبعدين نخليها تتنفذ
//   // ازاي ؟
//   // هسيب الجزء القديم ده في كومنت وشوف الجزء اللي بعده
//   // الشكل القديم
//   // const products = await Product.find(queryStringObj)
//   //   .skip(skip)
//   //   .limit(limit)
//   //   .populate({
//   //     path: "category",
//   //     select: "name -_id",
//   //   });
//   // console.log("req.query ::::", req.query);
//   // console.log("queryStringObj ::::", queryStringObj);
//   // قارن بين الاتنين كونسول اللي فوق هم في كومنت من الاول

//   // الشكل الجديد
//   // 1- Build query
//   const mongooseQuery = Product.find(queryStringObj)
//     // وبردو هنشيل جزء ال await
//     // لانها بتخلي الحاجة اللي بعدها تتنفذ على طول واحنا مش عايزين كده
//     .skip(skip)
//     .limit(limit)
//     .populate({
//       path: "category",
//       select: "name -_id",
//     });
//   // 2- execute Query
//   const products = await mongooseQuery;
//   // شوف الكومنت اللي في اخر الفايل خالص
//   res.status(200).json({results: products.length, page, data: products});
// });

// Getproducts from video 72
exports.getProducts = asyncHandler(async (req, res) => {
  // 1- Filtering
  const queryStringObj = {...req.query};
  const excludesFields = ["page", "sort", "limit", "fields", "keyword"];
  excludesFields.forEach((field) => delete queryStringObj[field]);

  // Apply filtering using [gte,gt,lte,lt]=>مشروح في الورق
  let queryStr = JSON.stringify(queryStringObj);
  queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, (match) => `$${match}`);
  // console.log(JSON.parse(queryStr));

  // 2- pagination
  const page = req.query.page * 1 || 1;
  const limit = req.query.limit * 1 || 50;
  const skip = (page - 1) * limit;

  // 1- Build query
  let mongooseQuery = Product.find(JSON.parse(queryStr))
    .skip(skip)
    .limit(limit)
    .populate({
      path: "category",
      select: "name -_id",
    });

  // 3-Sorting : (After filtering and pagination)
  if (req.query.sort) {
    // console.log(req.query.sort);

    const sortBy = req.query.sort.split(",").join(" ");
    mongooseQuery = mongooseQuery.sort(sortBy);
    // console.log(sortBy);

    // هنستخدم السبليت والجوين زي ال ريجيولار اكسبريشن اللي فوق
    // لان ال .sort
    // لو عندك حاجتين عايز ترتب بناء عليهم بتقبلهم بالشكل ده : .sort(price sold)
    // لكن انت جايلك الريكوست من بوستمان في بينهم ","
  } else {
    mongooseQuery = mongooseQuery.sort("-createdAt");
  }

  // 4- fields limiting (limit which field return)
  if (req.query.fields) {
    // title,ratingsAverage,imageCover,price
    const fields = req.query.fields.split(",").join(" ");
    // title ratingsAverage imageCover price
    mongooseQuery = mongooseQuery.select(fields);
  } else {
    mongooseQuery = mongooseQuery.select("-__v");
  }

  // 5 - Search : Get all products them name or "description" contain specific word
  //بنعمل اوبجيكت اسمه كويري
  //  ده عامل فلترة من مونجو
  // بنحط فيه لوجيكال اور معناه "أي واحد من الشروط دي ينطبق"
  // النتيجة هتجيب السجلات اللي عناوينها تطابق الشرط الأول أو الوصف يطابق الشرط التاني.
  if (req.query.keyword) {
    const query = {};
    query.$or = [
      {title: {$regex: req.query.keyword, $options: "i"}}, //mens = MENS
      /* $regex: نمط بحث (regular expression). هنا بنمرّر النص اللي المستخدم كتبه كـ pattern.
      $options: "i": الخيار "i" معناه case-insensitive — يعني البحث ما يفرقش بين حروف كبيرة وصغيرة.
      النمط ده بيدور داخل النص (contains) — مش لازم يكون البداية أو النهاية.*/
      {description: {$regex: req.query.keyword, $options: "i"}},
    ];
    mongooseQuery = mongooseQuery.find(query);
  }
  // 2- execute Query
  const products = await mongooseQuery;
  // شوف الكومنت اللي في اخر الفايل خالص
  res.status(200).json({results: products.length, page, data: products});
});

// @desc get specific Product by id
// @route GET /api/va/products/:id
// access Public
exports.getProduct = asyncHandler(async (req, res, next) => {
  const id = req.params.id;
  const product = await Product.findById(id).populate({
    path: "category",
    select: "name -_id",
  });
  if (!product) {
    // res.status(404).json({ msg: `No product For this ${id}` });
    return next(new ApiError(`No product For this ${id}`, 404));
  }
  res.status(200).json({data: product});
});

//  @desc create product
//  @route POST /api/v1/products
// @access Private

exports.createProduct = asyncHandler(async (req, res) => {
  req.body.slug = slugify(req.body.title);

  // validate for category
  // const category = Category.findById(req.body.category)
  // بس هننقل الكلام ده للفلاديشن لاير

  const product = await Product.create(req.body);
  //   كده هنخلي كل الحاجات اللي بتيجي في البودي
  // هتتبعت للداتا بيز
  // لكن في الكاتيجوري مثلا كنا بنبعت الاسم بس
  //   هنا هنبعت الديسكربشن و ...
  // الحاجات اللي كتبناها في الموديل
  res.status(201).json({data: product});

  // const newproduct = new productModel({ name });
  // newProduct
  //   .save()
  //   .then((doc) => {
  //     res.json(doc);
  //   })
  //   .catch((err) => {
  //     res.json(err);
  //   });
});

//  @desc Update specific product
//  @route PUT /api/v1/products/:id
// @access Private

exports.updateProduct = asyncHandler(async (req, res, next) => {
  const {id} = req.params; // == req.params.id
  if (req.body.title) {
    req.body.slug = slugify(req.body.title);
  }
  const product = await Product.findOneAndUpdate({_id: id}, req.body, {
    new: true,
  });
  // new : true = عشان يرجع البرودكت بعد ما يعملها ابديت مش قبل

  if (!product) {
    // res.status(404).json({ msg: `No Product For this ${id}` });
    return next(new ApiError(`No product For this ${id}`, 404));
  }

  res.status(201).json({data: product});
});

//  @desc Delete specific product
//  @route DELETE /api/v1/products/:id
// @access Private

exports.deleteProduct = asyncHandler(async (req, res, next) => {
  const {id} = req.params;
  const product = await Product.findByIdAndDelete(id);
  if (!product) {
    // res.status(404).json({ msg: `No product For this ${id}` });
    return next(new ApiError(`No product For this ${id}`, 404));
  }
  res.status(204).send();
});

// -------------------
//  comment about why we build query and execute after

/*
  🔎 ليه عملنا Build & Execute هنا؟

  - الـ getProducts غالبًا أكتر endpoint معقد:
    • فيه Filtering
    • فيه Pagination
    • ممكن نزود Sorting و Field Limiting
    • فيه Populate

  - يعني الكويري مش خطوة واحدة، لكنه بيتبني على مراحل.

  - لو كتبناه بالطريقة القديمة → الكود هيبقى متداخل وصعب تضيف/تشيل features.
  - لكن لما نفصل "البناء" (Build query) عن "التنفيذ" (Execute query) →
    الكود يبقى منظم وأسهل في التطوير.

  ✅ هل لازم نعمل كده في كل الـ services؟
  - مش شرط.
  - لو السيرفس بسيط (زي getCategoryById أو createUser) → ممكن تنفذ الكويري مباشرة.
  - لو السيرفس معقد (فيه Filtering, Pagination, Sorting …) → الأفضل تعمل Build & Execute.
*/
