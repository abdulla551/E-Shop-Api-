const factory = require("./handlersFactory");
const Coupon = require("../models/couponModel");

// @desc Get list of Coupons
// @route GET /api/v1/coupons
// @access Private/admin-manager
exports.getCoupons = factory.getAll(Coupon);

// @desc get specific coupon by id
// @route GET /api/va/coupons/:id
// access Private/admin-manager
exports.getCoupon = factory.getOne(Coupon);

//  @desc create coupon
//  @route POST /api/v1/coupons
// @access Private/admin-manager
exports.createCoupon = factory.createOne(Coupon);

//  @desc Update specific coupon
//  @route PUT /api/v1/coupons/:id
// @access Private/admin-manager
exports.updateCoupon = factory.updateOne(Coupon);

//  @desc Delete specific coupon
//  @route DELETE /api/v1/coupons/:id
// @access Private/admin-manager
exports.deleteCoupon = factory.deleteOne(Coupon);
