const multer = require("multer");
const ApiError = require("../utils/apiError");

// الشكل اللي بين الشرطتين قبل الريفاكتورينج شوف بعد هبكونوا ازاي
// باختصار البودي بتاع الاتنين ميثود هو هو معدا اخر سطر ف هنعمل ريفاكتور

// BEFORE REFACTOR
// ---------------------___(1)______--------------------------

// exports.uploadSingleImage = (fieldName) => {
//   const multerStorage = multer.memoryStorage();

//   const multerFilter = function (req, file, cb) {
//     // ال miimetype
//     // بتيجي بالشكل ده
//     // image/jpeg (شوف كونسول "BBBBBBBBBOOO"  عشان تتاكد)
//     if (file.mimetype.startsWith("image")) {
//       cb(null, true);
//     } else {
//       cb(new ApiError("Only Images Allowed", 400), false);
//     }
//   };

//   // MUlter Middleware
//   const upload = multer({storage: multerStorage, fileFilter: multerFilter});

//   return upload.single(fieldName);
// };

// // upload mix of images (used in product section)
// exports.uploadMixOfImages = (arrayOfFields) => {
//   const multerStorage = multer.memoryStorage();
//   const multerFilter = function (req, file, cb) {
//     if (file.mimetype.startsWith("image")) {
//       cb(null, true);
//     } else {
//       cb(new ApiError("Only Images Allowed", 400), false);
//     }
//   };

//   // MUlter Middleware
//   const upload = multer({storage: multerStorage, fileFilter: multerFilter});

//   return upload.fields(arrayOfFields);
// };
// ---------------------___(2)______--------------------------

// AFTER REFACTOR

const multerOptions = () => {
  const multerStorage = multer.memoryStorage();

  const multerFilter = function (req, file, cb) {
    if (file.mimetype.startsWith("image")) {
      cb(null, true);
    } else {
      cb(new ApiError("Only Images Allowed", 400), false);
    }
  };

  // MUlter Middleware
  const upload = multer({storage: multerStorage, fileFilter: multerFilter});
  return upload;
};

exports.uploadSingleImage = (fieldName) => {
  return multerOptions().single(fieldName);
};

// upload mix of images (used in product section)
exports.uploadMixOfImages = (arrayOfFields) => {
  return multerOptions().fields(arrayOfFields);
};
