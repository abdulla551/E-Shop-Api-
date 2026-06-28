//  MiddleWare=>catch errors from rules
// @desc find validation errors in this request and wrap them in an object with handy functions
const { validationResult } = require("express-validator");

const validatorMiddleWare =
  (req, res,next) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }
    next()
    // لو مفيش ايرروز روح للي بعد كده (الكنترولر)
  };
module.exports = validatorMiddleWare