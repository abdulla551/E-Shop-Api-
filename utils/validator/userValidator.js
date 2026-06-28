// @desc : this file combine Rules + validator middleware for each route

const {check, body} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const bcrypt = require("bcryptjs");
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const {default: slugify} = require("slugify");
const User = require("../../models/userModel");

exports.createUserValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({min: 3})
    .withMessage("Too short User name")
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),

  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val) =>
      User.findOne({email: val}).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already in Use"));
        }
      }),
    ),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({min: 6})
    .withMessage("Password must be at leas 6 chars")
    .custom((password, {req}) => {
      if (password !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation Incorrect");
      }
      return true;
    })
    .withMessage("Passwords do not match"),

  check("passwordConfirm")
    .notEmpty()
    .withMessage("Password Confirmation Required"),

  // check("phone").isMobilePhone("ar-EG")
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accept EG and SA phone numbers"),

  check("profileImg").optional(),

  check("role").optional(),

  validatorMiddleWare,
];

exports.getUserValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id Format "),
  validatorMiddleWare,
];

exports.updateUserVAlidator = [
  check("id").isMongoId().withMessage("Invalid User id Format "),

  // الجزء ده هنعمله عشان شيلنا ال slug
  // لما عملنا ريفاكتور في فيديو79
  body("name")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val) =>
      User.findOne({email: val}).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already in Use"));
        }
      }),
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accept EG and SA phone numbers"),
  check("profileImg").optional(),
  check("role").optional(),

  validatorMiddleWare,
];

exports.changeUserPasswordValidator = [
  check("id").isMongoId().withMessage("Invalid User id Format "),
  body("currentPassword")
    .notEmpty()
    .withMessage("You must Enter Your Current Password"),
  body("passwordConfirm")
    .notEmpty()
    .withMessage("You must enter password confirmation"),
  body("password")
    .notEmpty()
    .withMessage("You must Enter new Password")
    .custom(async (val, {req}) => {
      // 1- verify current pass:
      const user = await User.findById(req.params.id);
      if (!user) {
        throw new Error("THERE IS NO USER FOR THIS ID");
      }
      const isCorrectPassword = await bcrypt.compare(
        req.body.currentPassword,
        user.password,
      );
      if (!isCorrectPassword) {
        throw new Error("Incorrect current Password");
      }
      // 2- verify pass confirm
      if (val !== req.body.passwordConfirm) {
        throw new Error("Password Confirmation incorrect");
      }
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteUserVAlidator = [
  check("id").isMongoId().withMessage("Invalid User id Format "),
  validatorMiddleWare,
];

exports.updateLoggedUserVAlidator = [
  body("name")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address")
    .custom((val) =>
      User.findOne({email: val}).then((user) => {
        if (user) {
          return Promise.reject(new Error("Email Already in Use"));
        }
      }),
    ),
  check("phone")
    .optional()
    .isMobilePhone(["ar-EG", "ar-SA"])
    .withMessage("Invalid phone number only accept EG and SA phone numbers"),

  validatorMiddleWare,
];
