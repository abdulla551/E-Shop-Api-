const mongoose = require("mongoose");
const productSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      minlength: [3, "Too short product Title"],
      maxlength: [100, "Too long Product Title"],
    },
    slug: {
      type: String,
      required: true,
      lowercase: true,
    },
    description: {
      type: String,
      required: [true, "Product description is required"],
      minlength: [20, "too short product description"],
    },
    quantity: {
      type: Number,
      required: [true, "Product quantity is required"],
    },
    sold: {
      type: Number,
      default: 0,
    },
    price: {
      type: Number,
      required: [true, "product price is Required"],
      trim: true,
      max: [200000, "too long product price"],
      // NOT minlength
    },
    priceAfterDiscount: {
      type: Number,
    },
    colors: [String],
    // array of strings

    imageCover: {
      type: String,
      required: [true, "Image Cover is Required"],
    },
    images: [String],
    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category", // اسم الموديل اللي عايز يريفير ليه
      required: [true, "Product must belong to category"],
    },
    // array of subcategories: لانها مش هتكون واحدة بس غالبا زي الكاتيجوري
    subcategories: [
      {
        type: mongoose.Schema.ObjectId,
        ref: "subCategory",
      },
    ],
    brand: {
      type: mongoose.Schema.ObjectId,
      ref: "brand",
    },
    ratingsAverage: {
      type: Number,
      min: [1, "Rating must be above or equal 1.0"],
      max: [5, "Rating must be below or equal 5.0"],
      // NOT minlength or maxLength
    },
    ratingsQuantitiy: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
    // to enable virtual populate :-
    toJSON: {virtuals: true},
    toObject: {virtuals: true},
  },
);

// virtual populate (video 137)
productSchema.virtual("reviews", {
  ref: "Review",
  foreignField: "product",
  localField: "_id",
});
// الشرح :
// reviews ده فيلد
// الداتا اللي فيه روح هاتهالي من الموديل اللي اسمه ريفييو
// روح في الموديل ده على الفيلد اللي اسمه بروداكت
// وقارنه بال اي دي اللي هنا اللي هو بتاع البروداكت

// ========================================================================
// mongoose query MiddleWare for populate (video 84)
// اقرأ عن mongoose query
// احنا عايزين الميدلوير تحصل على كويري اسمها فايند
// لان البوبيوليت عايزين نعملها على كل ال get
productSchema.pre(/^find/, function (next) {
  // this prefers to the query
  this.populate({
    path: "category",
    select: "name",
  });
  next();
});

const setImageUrl = (doc) => {
  if (doc.imageCover) {
    const imageUrl = `${process.env.BASE_URL}/products/${doc.imageCover}`;
    doc.imageCover = imageUrl;
  }
  if (doc.images) {
    const imageList = [];
    doc.images.forEach((image) => {
      const imageUrl = `${process.env.BASE_URL}/products/${image}`;
      imageList.push(imageUrl);
    });
    doc.images = imageList;
  }
};
productSchema.post("init", function (doc) {
  setImageUrl(doc);
});
// create
productSchema.post("save", function (doc) {
  setImageUrl(doc);
});

// module.exports = mongoose.model("Product", productSchema);

const Product =
  mongoose.models.Product || mongoose.model("Product", productSchema);

module.exports = Product;
