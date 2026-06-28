// @desc : this file combine Rules + validator middleware for each route

const {check} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const {default: slugify} = require("slugify");
const User = require("../../models/userModel");

exports.signupValidator = [
  check("name")
    .notEmpty()
    .withMessage("User required")
    .isLength({min: 3})
    .withMessage("Too short User name")
    .withMessage("Too long User name")
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
      })
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

  validatorMiddleWare,
];

exports.loginValidator = [
  check("email")
    .notEmpty()
    .withMessage("Email Required")
    .isEmail()
    .withMessage("Invalid Email Address"),

  check("password")
    .notEmpty()
    .withMessage("Password required")
    .isLength({min: 6})
    .withMessage("Password must be at leas 6 chars"),

  validatorMiddleWare,
];
