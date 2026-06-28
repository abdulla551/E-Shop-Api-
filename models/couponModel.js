const mongoose = require("mongoose");

const couponSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true,
      required: [true, "coupon Name is required"],
      unique: true,
    },
    expire: {
      type: Date,
      required: [true, "Coupon Expire time required"],
    },
    discount: {
      type: Number,
      required: [true, "coupon Discount Value Required"],
    },
  },
  {timestamps: true},
);

module.exports = mongoose.model("coupon", couponSchema);
