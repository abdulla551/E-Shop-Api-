const express = require("express");

const {
  getUserValidator,
  updateUserVAlidator,
  deleteUserVAlidator,
  createUserValidator,
  changeUserPasswordValidator,
  updateLoggedUserVAlidator,
} = require("../utils/validator/userValidator");

const authService = require("../services/authService");

const {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  uploadUserImage,
  resizeImage,
  changeUserPassword,
  getLoggedUserData,
  updateLoggedUserPassword,
  updateLoggedUserData,
  deleteLoggedUser,
} = require("../services/userService");

const router = express.Router();

router.use(authService.protect);
router.get("/getMe", getLoggedUserData, getUser);
router.put("/changeMyPassword", updateLoggedUserPassword);
router.put("/updateMe", updateLoggedUserVAlidator, updateLoggedUserData);
router.delete("/deleteMe", deleteLoggedUser);

// Admin
router
  .route("/")
  .get(authService.allowedTo("admin"), getUsers)
  .post(
    authService.allowedTo("admin", "manager"),
    uploadUserImage,
    resizeImage,
    createUserValidator,
    createUser,
  );

router
  .route("/:id")
  .get(getUserValidator, getUser)
  .put(uploadUserImage, resizeImage, updateUserVAlidator, updateUser)
  .delete(deleteUserVAlidator, deleteUser);

// special Route for update pass (change password)
router.put(
  "/changePassword/:id",
  changeUserPasswordValidator,
  changeUserPassword,
);

module.exports = router;
