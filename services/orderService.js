const stripe = require("stripe")(
  process.env.STRIPE_SECRET || "sk_test_dummy_key_to_prevent_crash",
);

const asyncHandler = require("express-async-handler");
const factory = require("./handlersFactory");
const ApiError = require("../utils/apiError");

const Order = require("../models/orderModel");
const Cart = require("../models/cartModel");
const Product = require("../models/productModel");

// @desc create  cash order
// @route POST /api/v1/orders/:cartId
// @access Private/user
exports.createCashOrder = asyncHandler(async (req, res, next) => {
  // app setting(Admin decision):
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) get Cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(
        `there is mo cart with this cart id ${req.params.cartId}`,
        404,
      ),
    );
  }

  // 2) Get order price depend on cart total price after doing check if there is coupon applied
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) create order with default payment Method('cash')
  const order = await Order.create({
    user: req.user._id,
    cartItems: cart.cartItems,
    shippingAddress: req.body.shippingAddress,
    totalOrderPrice: totalOrderPrice,
  });
  // 4)After creating order, we need to : decrement product quantity and increment product sold number
  if (order) {
    const bulkOption = cart.cartItems.map((item) => ({
      updateOne: {
        filter: {
          _id: item.product,
        },
        update: {
          $inc: {quantity: -item.quantity, sold: +item.quantity},
        },
      },
    }));
    await Product.bulkWrite(bulkOption, {});

    // 5) clear user Cart depend on cartId
    await Cart.findByIdAndDelete(req.params.cartId);
  }
  res.status(201).json({status: "success", data: order});
});

// @desc Get all orders
// @route GET /api/v1/orders/
// @access Private/user-Admin-manager
exports.filterOrdersForLoggedUsers = asyncHandler(async (req, res, next) => {
  if (req.user.role === "user") req.filterObj = {user: req.user._id};
  next();
});
// عملنا الفلتر ده عشان نخلي الاوردرز بتاعه اليوزر ترجعله هو بس لو كان الرول يوزر
exports.findAllOrders = factory.getAll(Order);

// @desc Get specific order
// @route GET /api/v1/orders/:id
// @access Private/user-Admin-manager
exports.findSpecificOrder = factory.getOne(Order);

// @desc update order paid status to paid
// @route PUT /api/v1/orders/:id/pay
// @access Private/Admin-manager
exports.updateOrderToPaid = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`there is no such an order for this user`, 404));
  }

  // update order to paid
  order.isPaid = true;
  order.paidAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// @desc update order delivered status
// @route PUT /api/v1/orders/:id/deliver
// @access Private/Admin-manager
exports.updateOrderToDelivered = asyncHandler(async (req, res, next) => {
  const order = await Order.findById(req.params.id);
  if (!order) {
    return next(new ApiError(`there is no such an order for this user`, 404));
  }

  //update order delivered status
  order.isDelivered = true;
  order.deliveredAt = Date.now();

  const updatedOrder = await order.save();

  res.status(200).json({
    status: "success",
    data: updatedOrder,
  });
});

// ---- begging of Online payment with Stripe
// == 1 == create Session (send price) and send it to client Side in response
// @desc Get checkOut Session from stripe and send it as a response
// @route GET /api/v1/orders/checkout-session/cartId
// @access Private/user

exports.checkoutSession = asyncHandler(async (req, res, next) => {
  // app setting(Admin decision):
  const taxPrice = 0;
  const shippingPrice = 0;
  // 1) get Cart depend on cartId
  const cart = await Cart.findById(req.params.cartId);
  if (!cart) {
    return next(
      new ApiError(
        `there is mo cart with this cart id ${req.params.cartId}`,
        404,
      ),
    );
  }

  // 2) Get order price depend on cart total price after doing check if there is coupon applied
  const cartPrice = cart.totalPriceAfterDiscount
    ? cart.totalPriceAfterDiscount
    : cart.totalCartPrice;

  const totalOrderPrice = cartPrice + taxPrice + shippingPrice;

  // 3) create Stripe checkout Session
  const session = await stripe.checkout.sessions.create({
    line_items: [
      {
        price_data: {
          currency: "egp",
          product_data: {
            name: req.user.name,
          },
          unit_amount: Math.round(totalOrderPrice * 100),
        },
        quantity: 1,
      },
    ],
    mode: "payment",
    success_url: `${req.protocol}://${req.get("host")}/orders`,
    cancel_url: `${req.protocol}://${req.get("host")}/cart`,
    customer_email: req.user.email,
    client_reference_id: req.params.cartId,
    metadata: req.body.shippingAddress,
  });

  //  4- send session to Response
  res.status(200).json({status: "success", session});
});

exports.webhookCheckout = asyncHandler(async (req, res, next) => {
  const sig = req.headers["stripe-signature"];

  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET,
    );
  } catch (err) {
    return res.status(400).send(`webhool Error: ${err.message}`);
  }
  if (event.type === "checkout.session.completed") {
    console.log("Create Order Here");
  }
});
