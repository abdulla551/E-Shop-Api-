const mongoose = require("mongoose");

const subCategorySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      trim: true, // remove Spaces before/after name
      unique: [true, "SubCategory must Be Unique"],
      minlength: [2, "too short SubCategory Name"],
      maxlength: [32, "too long SubCategory Name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },

    category: {
      type: mongoose.Schema.ObjectId,
      ref: "Category",
      required: [true, "subCategory must be belong to parent Category"],
    },
    // شوفلها شرح تاني
  },

  {timestamps: true}
);

module.exports = mongoose.model("SubCategory", subCategorySchema);

// module.exports = mongoose.model("TESTCategory", subCategorySchema);
