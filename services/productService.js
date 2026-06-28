//  الفايل ده بعد ال ريفاكتورينج لل APIFEATURES

// const slugify = require("slugify");
// const asyncHandler = require("express-async-handler");
// const ApiError = require("../utils/apiError");
// const ApiFeatures = require("../utils/apiFeatures");
const factory = require("./handlersFactory");
const Product = require("../models/productModel");
const multer = require("multer");
const {v4: uuid4} = require("uuid"); //to generate unique id
const asyncHandler = require("express-async-handler");

const ApiError = require("../utils/apiError");
const sharp = require("sharp");
const {uploadMixOfImages} = require("../middlewares/uploadImageMiddleware");

// -----__________------ images start
exports.uploadProductImages = uploadMixOfImages([
  {
    name: "imageCover",
    maxCount: 1,
  },
  {
    name: "images",
    maxCount: 5,
  },
]);

// image processing
exports.resizeProductImages = asyncHandler(async (req, res, next) => {
  // console.log(req.files);
  // 1- image processing for imageCover
  if (req.files.imageCover) {
    const imageCoverFilename = `product-${uuid4()}-${Date.now()}-cover.jpeg`;
    await sharp(req.files.imageCover[0].buffer)
      .resize(2000, 1333) //width+ height
      .toFormat("jpeg")
      .jpeg({quality: 95})
      .toFile(`uploads/products/${imageCoverFilename}`); // مكان الحفظ
    req.body.imageCover = imageCoverFilename; // save image into DB
  }

  // 2-   // image processing for images
  if (req.files.images) {
    req.body.images = [];
    await Promise.all(
      req.files.images.map(async (img, index) => {
        // ليه promiseAll
        // لان ماب لو جواها حاجة await
        // مش بتستناها
        //  عشان كده استخدمنا promiseAll
        // عشان اجبرها تستنى
        const imageName = `product-${uuid4()}-${Date.now()}-${index + 1}.jpeg`;
        await sharp(img.buffer)
          .resize(2000, 1333) //width+ height
          .toFormat("jpeg")
          .jpeg({quality: 95})
          .toFile(`uploads/products/${imageName}`); // مكان الحفظ
        req.body.images.push(imageName); // save image into DB
      }),
    );
    console.log(req.body.imageCover);
    console.log(req.body.images); //لو مكنتش استخدمت بروميس الل كانت هترجع ارراي فاضية

    next();
  }
});

// -----__________------ images end

// @desc Get list of Products
// @route GET /api/v1/products
// @access Public

// video 84 شوف الفرق بين
// mongoose middleWare , express MiddleWare
// في الفيديو ده هنعمل ريفاكتور لل populate
// باستخدام mongoose middleWare
// video 83 getAll Factory Handler
exports.getProducts = factory.getAll(Product, "Product");
// asyncHandler(async (req, res) => {
//   // 1- Build query
//   const documentsCount = await Product.countDocuments();
//   const apiFeatures = new ApiFeatures(Product.find(), req.query)
//     .paginate(documentsCount)
//     .filter()
//     .search("Products")
//     .limitFields()
//     .sort();

//   // 2- execute Query
//   const {mongooseQuery, paginationResult} = apiFeatures;
//   const products = await mongooseQuery;

//   res
//     .status(200)
//     .json({results: products.length, paginationResult, data: products});
// });

// @desc get specific Product by id
// @route GET /api/va/products/:id
// access Public

// video 81 get Factory Handler
exports.getProduct = factory.getOne(Product, "reviews");
// asyncHandler(async (req, res, next) => {
//   const id = req.params.id;
//   const product = await Product.findById(id).populate({
//     path: "category",
//     select: "name -_id",
//   });
//   if (!product) {
//     // res.status(404).json({ msg: `No product For this ${id}` });
//     return next(new ApiError(`No product For this ${id}`, 404));
//   }
//   res.status(200).json({data: product});
// });

//  @desc create product
//  @route POST /api/v1/products
// @access Private

// video 81 create Factory Handler
exports.createProduct = factory.createOne(Product);
// asyncHandler(async (req, res) => {
//   req.body.slug = slugify(req.body.title);

//   const product = await Product.create(req.body);

//   res.status(201).json({data: product});
// });

//  @desc Update specific product
//  @route PUT /api/v1/products/:id
// @access Private

// video 80 Update Factory Handler
exports.updateProduct = factory.updateOne(Product);

// asyncHandler(async (req, res, next) => {
//   const {id} = req.params; // == req.params.id
//   if (req.body.title) {
//     req.body.slug = slugify(req.body.title);
//   }
//   const product = await Product.findOneAndUpdate({_id: id}, req.body, {
//     new: true,
//   });

//   if (!product) {
//     return next(new ApiError(`No product For this ${id}`, 404));
//   }

//   res.status(201).json({data: product});
// });

//  @desc Delete specific product
//  @route DELETE /api/v1/products/:id
// @access Private

// video 79 Delete Factory Handler
exports.deleteProduct = factory.deleteOne(Product);

// asyncHandler(async (req, res, next) => {
//   const {id} = req.params;
//   const product = await Product.findByIdAndDelete(id);
//   if (!product) {
//     // res.status(404).json({ msg: `No product For this ${id}` });
//     return next(new ApiError(`No product For this ${id}`, 404));
//   }
//   res.status(204).send();
// });

// END
// -----
// -----
// -----
// -----
// -----
/* 
  ليه بنبعت للكلاس Product.find()
   
new ApiFeatures(Product, req.query)
والكلاسيز نفسها فيها ال find
ChatGPT said:

أيوه ✨ هنا في نقطة مهمة:

إنت بتسأل: ليه بنمرر Product.find() مش Product نفسه؟

خليني أوضح الفرق:

1. لو بعت Product بس:
new ApiFeatures(Product, req.query)


كده إنت مديت الكلاس الموديل نفسه.

يعني this.mongooseQuery جوه الكلاس = Product، وده كائن الموديل مش استعلام.

وبالتالي لما تيجي تعمل this.mongooseQuery.find(...)، هيشتغل (لأن find موجودة في الموديل) لكن هيفتح استعلام جديد كل مرة.

وده معناه إن أي فلترة أو sort أو pagination تعملهم قبل كده هتروح، لإنك بتبدأ استعلام جديد من الصفر.

2. لو بعت Product.find():
new ApiFeatures(Product.find(), req.query)


كده إنت مديت الكلاس استعلام جاهز (Query object) مش الموديل.

وده الاستعلام اللي هتفضل تبني عليه خطوة بخطوة:

في filter() تضيف فلترة.

في sort() تضيف ترتيب.

في paginate() تضيف skip/limit.

كل ده بيتراكم على نفس الاستعلام اللي ابتدأته، ولما تخلص، تعمل .exec() أو await عليه عشان يجيب النتيجة النهائية.

🔑 الخلاصة:

Product = الموديل (اللي فيه methods زي find, create, updateOne …).

Product.find() = استعلام (Query object) تقدر تبني عليه سلسلة عمليات (filter → sort → paginate).

وده السبب إننا بنمرر Product.find() مش Product للكلاس.

تحب أعمللك كود تجريبي يبينلك الفرق في الـ console بين الطريقتين؟
  */
