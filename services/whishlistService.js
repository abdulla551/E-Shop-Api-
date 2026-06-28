const asyncHandler = require("express-async-handler");

const User = require("../models/userModel");

// @desc Add Product to whishlist
// @route POST /api/v1/whishlist
// @access protected/User
exports.addProductToWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {whishlist: req.body.productId},
      // addToSet :
      // (1)اوبيراتور في مونجو بنستخدمه عشان لو
      // عندنا ارراي في الداتابيز او الكوليشكن عايزين نضيف ليها قيمة
      // (2) بنكتب اسم الارراي اللي عايزين نضيف فيها
      // والقيمة اللي عايزها تتضاف ليها
    },
    {new: true},
  );
  res.status(200).json({
    status: "success",
    message: "Product Added Successfully to your whishlist",
    data: user.whishlist,
  });
});

// @desc remove Product from whishlist
// @route DELETE /api/v1/whishlist/:productId
// @access protected/User
exports.removeProductFromWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {whishlist: req.params.productId},
      // pull :
      // (1)اوبيراتور في مونجو بنستخدمه عشان لو
      // عندنا ارراي في الداتابيز او الكوليشكن عايزين نحذف منها منتج
      // (2) بنكتب اسم الارراي اللي عايزين نضيف فيها
      // واي دي المنتج اللي عايزه يتمسح منها
      //   "Removed prodId from arryList if exist"
    },
    {new: true},
  );
  res.status(200).json({
    status: "success",
    message: "Product Removed Successfully from your whishlist",
    data: user.whishlist,
  });
});

// @desc get logged user whishlist
// @route GET /api/v1/whishlist
// @access protected/User
exports.getLoggerUSerWishlist = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("whishlist");
  res.status(200).json({
    status: "success",
    results: user.whishlist.length,
    data: user.whishlist,
  });
});
