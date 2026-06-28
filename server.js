const path = require("path"); //core module

//third party module
const express = require("express");
const dotenv = require("dotenv");
const morgan = require("morgan");
const cors = require("cors");
const compression = require("compression");

// module imported from our folders
dotenv.config({path: "config.env"});
const ApiError = require("./utils/apiError");
const globalErrorHandle = require("./middlewares/errorMiddleware");
const dbConnection = require("./config/database");

// Routes
const mountRoutes = require("./routes/index");
// const categoryRoute = require("./routes/categoryRoute");
// const subcategoryRoute = require("./routes/subCategoryRoute");
// const brandRoute = require("./routes/brandRoute");
// const productRoute = require("./routes/productRoute");
// const userRoute = require("./routes/userRoute");
// const authRouter = require("./routes/authRoute");
// const reviewRouter = require("./routes/reviewRoute");
// const wishlistRoute = require("./routes/whishlistRoute");
// const addressRoute = require("./routes/addressRoute");
// const couponRoute = require("./routes/couponRoute");

// connect with db
dbConnection();

//   express App
const app = express();
// بكرييت ابب من اكسبريس

// Enable other domain to access your application
app.use(cors());
app.options(/.*/, cors());

// compress all Responses
app.use(compression());

app.set("query parser", "extended");

// middlewares
app.use(express.json());
app.use(express.static(path.join(__dirname, "uploads")));
// اكسبريس ستاتيك هي ميدلوير بتخلي اي ملفات جوا الفولدر اللي حددنا مكانه تبقى متاحة
// عبر HTTP مباشرة
// يعني اي ملف جوه الفولدر ممكن يتعرض من خلال URL
// من غير ما نعمل
// راوت مخصوص ليه
// معنى كده ان ممكن في البراوزر تكتب
// http://localhost:8000/categories/category-8b857432-bf19-41d0-9295-1fac430ef4f6-1759937397333.jpeg
// تلاقي الصورة اللي انت حاطط اسمها فتحت معاك
// كانك عاكلها راوت وسيرفيس عادي
// --------

// morgan
if (process.env.NODE_ENV === "development") {
  app.use(morgan("dev"));
  console.log(`mode:${process.env.NODE_ENV}`);
}

// Mount Routes
mountRoutes(app);
// app.use("/api/v1/categories", categoryRoute);
// app.use("/api/v1/subCategories", subcategoryRoute);
// app.use("/api/v1/brands", brandRoute);
// app.use("/api/v1/products", productRoute);
// app.use("/api/v1/users", userRoute);
// app.use("/api/v1/auth", authRouter);
// app.use("/api/v1/reviews", reviewRouter);
// app.use("/api/v1/wishlist", wishlistRoute);
// app.use("/api/v1/addresses", addressRoute);
// app.use("/api/v1/coupons", couponRoute);

// لو اي راوتس انا مش عامله هاندلينج فوق :
// بنتحكم في شكل الايرور
// بنعمل الايرور هنا وبنرميه لل جلوبال ايرور هاندينج
app.use((req, res, next) => {
  // 1- create error
  // const err = new Error(`Can't find this Route ${req.originalUrl}`)
  // 2- and send it to error handling mid
  // next(err.message)

  // الطريقة الجديدة:
  // next(new ApiError("any message", statusCode))
  next(new ApiError(`Can't find this Route ${req.originalUrl}`, 400));
});

// Global error Handling MiddleWare for express:
// وده بيتنفذ لو حصل اي ايرور في الجزء اللي فوق اللي هو اللي تحت كلمة ماونت راوتس
// وطبعا ده اللي بيحتوي على كل ال controllers
// فلو حصل اي ايررور فيهمم هيتنفذ الميدل وير هاندلر ده
// app.use((err,req,res,next)=>{
// // res.status(400).json({err})
// // بدل ما هو هارد كوديد ممكن نخليه كده:
// err.statusCode = err.statusCode || 500
// err.status = err.status || "error"
// res.status(err.statusCode).json({
//   error:err,
//   status:err.status,
//   message:err.message,
//   stack:err.stack
// })
// })

// هنعملها ريفاكتور ونوديها فايل في فولدر الميدلويرز
app.use(globalErrorHandle);

const PORT = process.env.PORT || 8000;
const server = app.listen(PORT, () => {
  console.log(`App running on Port ${PORT}`);
});

// معناها: افتح server
// واسمع أي requests جاية على البورت 8000.

// console.log("App running");
// ده callback function بتتنفذ أول ما السيرفر يشتغل .

// Handle Rejections Outside Express
// هنا هنهندل اي ايررور بيحصل من بره اكسبريس زي dbConnection()
// او اي حاجة عامة مش في اكسبريس
// Events =>listen =>callback
// لما بيحصل ريجكشن في ايفنت بيحصل عنده init
// بنعمل ليسن للايفنت ده وبيرجع كول باك
process.on("unhandledRejection", (err) => {
  console.error(`UnhandledRejection error:${err.name} | ${err.message}`);
  server.close(() => {
    console.log(`Shutting Down ....`);

    process.exit(1);
  });
});
// جرب تغير في كونفيج بتاع الداتا بيز وشوف البي هيحصل
