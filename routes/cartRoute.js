const express = require("express");

const authService = require("../services/authService");
const {
  addProductToCart,
  getLoggedUserCart,
  removeSpecificCartItem,
  clearUserCart,
  updateItemQuantity,
  applyCoupon,
} = require("../services/cartServiceFile");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));
router
  .route("/")
  .post(addProductToCart)
  .get(getLoggedUserCart)
  .delete(clearUserCart);

router.put("/applyCoupon", applyCoupon);

router.route("/:itemId").delete(removeSpecificCartItem).put(updateItemQuantity);

module.exports = router;
