const express = require("express");

const authService = require("../services/authService");
const {
  createCashOrder,
  findAllOrders,
  findSpecificOrder,
  filterOrdersForLoggedUsers,
  updateOrderToPaid,
  updateOrderToDelivered,
  checkoutSession,
} = require("../services/orderService");

const router = express.Router();

// router.use(authService.protect, authService.allowedTo("user"));

router.get(
  "/checkout-session/:cartId",
  authService.protect,
  authService.allowedTo("user"),
  checkoutSession,
);

router.route("/:cartId").post(createCashOrder);

router.get(
  "/",
  authService.protect,
  authService.allowedTo("user", "admin", "manager"),
  filterOrdersForLoggedUsers,
  findAllOrders,
);

router.get("/:id", findSpecificOrder);

router.put(
  "/:id/pay",
  authService.protect,
  authService.allowedTo("admin", "manager"),
  updateOrderToPaid,
);

router.put(
  "/:id/deliver",
  authService.protect,
  authService.allowedTo("admin", "manager"),
  updateOrderToDelivered,
);

module.exports = router;
