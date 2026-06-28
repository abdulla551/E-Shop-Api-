const asyncHandler = require("express-async-handler");
const User = require("../models/userModel");

// @desc Add Address to user Addresses List
// @route POST /api/v1/Addresses
// @access protected/User
exports.addAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $addToSet: {addresses: req.body},
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
    message: "Address Added Successfully ",
    Addresses: user.addresses,
  });
});

// @desc remove Address from Addresses list
// @route DELETE /api/v1/addresses/:addressId
// @access protected/User
exports.removeAddress = asyncHandler(async (req, res, next) => {
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      $pull: {addresses: {_id: req.params.addressId}},
      // pull :
      // (1)اوبيراتور في مونجو بنستخدمه عشان لو
      // عندنا ارراي في الداتابيز او الكوليشكن عايزين نحذف منها منتج
      // (2) بنكتب اسم الارراي اللي عايزين نضيف فيها
      // واي دي عنوان اللي عايزه يتمسح منها
      //   "Removed Address from arrayList if exist"
    },
    {new: true},
  );
  res.status(200).json({
    status: "success",
    message: "address Removed Successfully ",
    data: user.addresses,
  });
});

// @desc get logged user addresses
// @route GET /api/v1/addresses
// @access protected/User
exports.getLoggerUSerAddresses = asyncHandler(async (req, res, next) => {
  const user = await User.findById(req.user._id).populate("addresses");
  res.status(200).json({
    status: "success",
    results: user.addresses.length,
    data: user.addresses,
  });
});
