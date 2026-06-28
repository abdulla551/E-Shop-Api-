// @desc : this file combine Rules + validator middleware for each route

const {check, body} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const {default: slugify} = require("slugify");

exports.getBrandValidator = [
  check("id").isMongoId().withMessage("Invalid Brand id Format "),
  validatorMiddleWare,
];

exports.createBrandValidator = [
  check("name")
    .notEmpty()
    .withMessage("Brand required")
    .isLength({min: 3})
    .withMessage("Too short Brand name")
    .isLength({max: 32})
    .withMessage("Too long Brand name")
    // الجزء ده هنعمله عشان شيلنا ال slug
    // لما عملنا ريفاكتور في فيديو79
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.updateBrandVAlidator = [
  check("id").isMongoId().withMessage("Invalid Brand id Format "),

  // الجزء ده هنعمله عشان شيلنا ال slug
  // لما عملنا ريفاكتور في فيديو79
  body("name")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.deleteBrandVAlidator = [
  check("id").isMongoId().withMessage("Invalid Brand id Format "),
  validatorMiddleWare,
];
