const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");

const Cart = require("../models/cartModel");
const Coupon = require("../models/couponModel");
const Product = require("../models/productModel");

const calcTotalCartPrice = (cart) => {
  let totalPrice = 0;
  cart.cartItems.forEach((item) => {
    totalPrice += item.quantity * item.price;
    cart.totalCartPrice = totalPrice;
  });

  cart.totalPriceAfterDiscount = undefined;
  return totalPrice;
};

// @desc Add Product to Cart
// @route POST /api/v1/cart
// @access Private/User

exports.addProductToCart = asyncHandler(async (req, res, next) => {
  const {productId, color} = req.body;
  const product = await Product.findById(productId);

  // 1- Get Cart for Logged User
  let cart = await Cart.findOne({user: req.user._id});

  if (!cart) {
    // create cart for this logged user with the product
    cart = await Cart.create({
      user: req.user._id,
      cartItems: [
        {
          product: productId,
          color: color,
          price: product.price,
        },
      ],
    });
  } else {
    // ==1==  if product exist in cart , update product quantity
    const productIndex = cart.cartItems.findIndex(
      (item) => item.product.toString() === productId && item.color === color,
    );
    // console.log(productExist);
    // بترجع الاندكس بتاع الايتم وبالتالي احيانا ممكن يرجع صفر لو في اول عنصر في الارراي
    // لذلك هنا هنقول لو اكبر من -1 بمعنى انها عدت من اللي فوق
    // وفي عناصر عندي فعلا

    if (productIndex > -1) {
      // now update quantity
      const cartItem = cart.cartItems[productIndex];
      cartItem.quantity += 1;
      //   add the same item to cart items after being updated
      cart.cartItems[productIndex] = cartItem;
    } else {
      //  ==2==  if not , push the new product to cartItem Array
      cart.cartItems.push({
        product: productId,
        color: color,
        price: product.price,
      });
    }
  }

  //   calculate total cart price
  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    message: "product Added to Cart Successfully",
    productTypeCount: cart.cartItems.length,
    data: cart,
  });
});

// @desc get logged user Cart
// @route GET /api/v1/cart
// @access Private/User

exports.getLoggedUserCart = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOne({user: req.user._id});

  if (!cart) {
    return next(
      new ApiError(`there is no cart for this user id ${req.user._id}`, 404),
    );
  }

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc remove specific Cart item
// @route DELETE /api/v1/cart/:itemId
// @access Private/User

exports.removeSpecificCartItem = asyncHandler(async (req, res, next) => {
  const cart = await Cart.findOneAndUpdate(
    {user: req.user._id},
    {
      $pull: {cartItems: {_id: req.params.itemId}},
    },
    {new: true},
  );

  calcTotalCartPrice(cart);
  cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc clear User Cart
// @route DELETE /api/v1/cart
// @access Private/User

exports.clearUserCart = asyncHandler(async (req, res, next) => {
  await Cart.findOneAndDelete({user: req.user._id});
  res.status(204).send();
});

// @desc update Cart Item quantity
// @route PUT /api/v1/cart/:itemId
// @access Private/User
exports.updateItemQuantity = asyncHandler(async (req, res, next) => {
  const {quantity} = req.body;
  const cart = await Cart.findOne({user: req.user._id});
  if (!cart) {
    return next(new ApiError(`there is no Cart for this User`, 404));
  }
  const itemIndex = cart.cartItems.findIndex(
    (index) => index._id.toString() == req.params.itemId,
  );
  if (itemIndex > -1) {
    const cartItem = cart.cartItems[itemIndex];
    cartItem.quantity = quantity;
    cart.cartItems[itemIndex] = cartItem;
  } else {
    return next(
      new ApiError(`there is no item for this id ${req.params.itemId}`, 404),
    );
  }

  calcTotalCartPrice(cart);

  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});

// @desc Apply Coupon on logged Cart
// @route PUT /api/v1/cart/ApplyCoupon
// @access Private/User
exports.applyCoupon = asyncHandler(async (req, res, next) => {
  // 1) Get Coupon based on Coupon Name
  const coupon = await Coupon.findOne({
    name: req.body.coupon,
    expire: {$gt: Date.now()},
  });
  if (!coupon) {
    return next(new ApiError(`coupon is invalid or Expired`, 404));
  }
  // 2) get logged user cart to get total cart price
  const cart = await Cart.findOne({user: req.user._id});
  const totalPrice = cart.totalCartPrice;

  // 3)calc price after discount
  const totalPriceAfterDiscount =
    totalPrice - totalPrice * (coupon.discount / 100).toFixed(2);

  cart.totalPriceAfterDiscount = totalPriceAfterDiscount;
  await cart.save();

  res.status(200).json({
    status: "success",
    numberOfCartItems: cart.cartItems.length,
    data: cart,
  });
});
