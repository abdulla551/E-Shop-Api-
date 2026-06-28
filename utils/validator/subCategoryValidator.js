// @desc : this file combine Rules + validator middleware for each route

const {check, body} = require("express-validator");
// check: لاي حد بقى سواء param,query,body
const validatorMiddleWare = require("../../middlewares/validatorMiddleWare");
const {default: slugify} = require("slugify");

exports.getSubCategoryValidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id Format "),
  validatorMiddleWare,
];

exports.createSubCategoryValidator = [
  check("name")
    .notEmpty()
    .withMessage("subCategory required")
    .isLength({min: 2})
    .withMessage("Too short subCategory name")
    .isLength({max: 32})
    .withMessage("Too long subCategory name")
    // الجزء ده هنعمله عشان شيلنا ال slug
    // لما عملنا ريفاكتور في فيديو79
    .custom((val, {req}) => {
      req.body.slug = slugify(val);
      return true;
    }),
  check("category")
    .notEmpty()
    .withMessage(`SubCategory must belong to Category`)
    .isMongoId()
    .withMessage("Invalid Category Id Format"),

  validatorMiddleWare,
];

exports.updateSubCategoryVAlidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id Format "),

  // الجزء ده هنعمله عشان شيلنا ال slug
  // لما عملنا ريفاكتور في فيديو79
  body("name").custom((val, {req}) => {
    req.body.slug = slugify(val);
    return true;
  }),
  validatorMiddleWare,
];

exports.deleteSubCategoryVAlidator = [
  check("id").isMongoId().withMessage("Invalid subCategory id Format "),
  validatorMiddleWare,
];
