const mongoose = require("mongoose");
// 1- Create Schema
const categorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Category required"],
      unique: [true, "Category must be unique"],
      minlength: [3, "Too short category name"],
      maxlength: [32, "Too long category name"],
    },
    // A and B => shoping.com/a-and-b
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {timestamps: true}
);

//الجزء اللي بين الشرطتين هعملهم كومنت عشان هنعملهم ريفاكتور تحتهم
// init works fine with :
// update - findAll - findOne -- Not work with 'create'
// mongoose "post" middleware : to generate image URL (vid:93)
//-------------- _____________________________--------------(1)

// categorySchema.post("init", function (doc) {
//   // return image URl (base URL + image name)
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;
//     // الجزء الاولاني ده لانها بتتغير على حسب احنا ف انهي مود
//     // لو البروداكشن هتبقى لوكال هوست وهكذا
//     // والجزء اللي في الاخر ده اسم الصورة عادي
//     doc.image = imageUrl;
//   }
// });

// // for the 'create' : Which not working with 'init'
// categorySchema.post("save", function (doc) {
//   // return image URl (base URL + image name)
//   if (doc.image) {
//     const imageUrl = `${process.env.BASE_URL}/categories/${doc.image}`;

//     doc.image = imageUrl;
//   }
// });

//-------------- _____________________________--------------(2)

// MONGOOSE MIDDLEWARES :  AFTER REFACTOR =>
const setImageUrl = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/categories/${doc.image}`;
  }
};
categorySchema.post("init", function (doc) {
  setImageUrl(doc);
});
// create
categorySchema.post("save", function (doc) {
  setImageUrl(doc);
});

// 2- Create model
const CategoryModel = mongoose.model("Category", categorySchema);

module.exports = CategoryModel;
