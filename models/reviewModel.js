const mongoose = require("mongoose");
const Product = require("./productModel");

const reviewSchema = new mongoose.Schema(
  {
    title: {
      type: String,
    },
    ratings: {
      type: Number,
      min: [1, "Min Ratings value is 1.0"],
      max: [5, "Max Ratings value is 5.0"],
      required: [true, "Review Ratings Required"],
    },
    user: {
      type: mongoose.Schema.ObjectId,
      ref: "User",
      required: [true, "Review must belong to user"],
    },
    // Parent Reference (one to many relationship)
    product: {
      type: mongoose.Schema.ObjectId,
      ref: "Product",
      required: [true, "Review must belong to product"],
    },
  },
  {timestamps: true},
);

reviewSchema.pre(/^find/, function (next) {
  this.populate({path: "user", select: "name"});
  next();
});

reviewSchema.statics.calcAverageRatingsAndQuantity = async function (
  productId,
) {
  const result = await this.aggregate([
    // Stage 1 : get all reviews in specific product
    {$match: {product: productId}},
    // Stage 2: grouping (بنجمعهم في مكان ونعمل عليهم العمليات)
    {
      $group: {
        _id: "product",
        avgRatings: {$avg: "$ratings"},
        ratingsQuantity: {$sum: 1},
      },
    },
  ]);
  // console.log("result:", result);
  if (result.length > 0) {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: result[0].avgRatings,
      ratingsQuantitiy: result[0].ratingsQuantity,
    });
  } else {
    await Product.findByIdAndUpdate(productId, {
      ratingsAverage: 0,
      ratingsQuantitiy: 0,
    });
  }
};

reviewSchema.post("save", async function () {
  await this.constructor.calcAverageRatingsAndQuantity(this.product);
});

reviewSchema.post(
  "deleteOne",
  {document: true, query: false},
  async function () {
    await this.constructor.calcAverageRatingsAndQuantity(this.product);
  },
);
module.exports = mongoose.model("Review", reviewSchema);
