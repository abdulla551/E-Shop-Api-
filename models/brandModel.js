const mongoose = require("mongoose");
// 1- Create Schema
const brandSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "brand required"],
      unique: [true, "brand must be unique"],
      minlength: [3, "Too short brand name"],
      maxlength: [32, "Too long brand name"],
    },
    slug: {
      type: String,
      lowercase: true,
    },
    image: String,
  },
  {timestamps: true}
);

const setImageUrl = (doc) => {
  if (doc.image) {
    doc.image = `${process.env.BASE_URL}/brands/${doc.image}`;
  }
};
brandSchema.post("init", function (doc) {
  setImageUrl(doc);
});
// create
brandSchema.post("save", function (doc) {
  setImageUrl(doc);
});

// 2- Create model
module.exports = mongoose.model("brand", brandSchema);
