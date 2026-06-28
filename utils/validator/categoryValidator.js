// @desc : this file combine Rules + validator middleware for each route

const {check, body} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const {default: slugify} = require("slugify");

exports.getCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid Category id Format "),
  validatorMiddleWare,
];

exports.createCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("Category required")
    .isLength({min: 3})
    .withMessage("Too short category name")
    .isLength({max: 32})
    .withMessage("Too long category name")
    // الجزء ده هنعمله عشان شيلنا ال slug
    // لما عملنا ريفاكتور في فيديو79
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  validatorMiddleWare,
];

exports.updateCategoryVAlidator = [
  check("id").isMongoId().withMessage("Invalid Category id Format "),

  // الجزء ده هنعمله عشان شيلنا ال slug
  // لما عملنا ريفاكتور في فيديو79
  body("title")
    .optional()
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),

  // الجزء ده هنعمله عشان شيلنا ال slug
  // لما عملنا ريفاكتور في فيديو79
  body("name").custom((val, {req}) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleWare,
];

exports.deleteCategoryVAlidator = [
  check("id").isMongoId().withMessage("Invalid Category id Format "),
  validatorMiddleWare,
];
