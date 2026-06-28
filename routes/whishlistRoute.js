const express = require("express");

const authService = require("../services/authService");
const {
  addProductToWishlist,
  removeProductFromWishlist,
  getLoggerUSerWishlist,
} = require("../services/whishlistService");

const router = express.Router();

router.use(authService.protect, authService.allowedTo("user"));
router.route("/").post(addProductToWishlist).get(getLoggerUSerWishlist);
router.delete("/:productId", removeProductFromWishlist);

module.exports = router;
