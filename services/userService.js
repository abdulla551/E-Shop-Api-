const asyncHandler = require("express-async-handler");
const {v4: uuid4} = require("uuid"); //to generate unique id
const sharp = require("sharp");
const bcrypt = require("bcryptjs");

const factory = require("./handlersFactory");
const {uploadSingleImage} = require("../middlewares/uploadImageMiddleware");

const createToken = require("../utils/createToken");

const User = require("../models/userModel");
const ApiError = require("../utils/apiError");
// const {default: bcrypt} = require("bcryptjs");

// upload single processing
exports.uploadUserImage = uploadSingleImage("profileImg");

// -------------------
// image processing
exports.resizeImage = asyncHandler(async (req, res, next) => {
  // console.log(req.file);
  const filename = `user-${uuid4()}-${Date.now()}.jpeg`;
  if (req.file) {
    // this if conditional makes the image is optional
    await sharp(req.file.buffer)
      .resize(600, 600)
      .toFormat("jpeg")
      .jpeg({quality: 90})
      .toFile(`uploads/users/${filename}`);
    req.body.profileImg = filename;
  }

  next();
});

// @desc Get list of User
// @route GET /api/v1/users
// @access private

exports.getUsers = factory.getAll(User);

// @desc get specific user by id
// @route GET /api/va/users/:id
// access Private

exports.getUser = factory.getOne(User);

//  @desc create user
//  @route POST /api/v1/users
// @access Private

exports.createUser = factory.createOne(User);

//  @desc Update specific user
//  @route PUT /api/v1/users/:id
// @access Private

exports.updateUser = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      name: req.body.name,
      slug: req.body.slug,
      phone: req.body.phone,
      email: req.body.email,
      profileImg: req.body.profileImg,
      role: req.body.role,
      // كده احنا عدلنا في كل الداتا معدا الباسورد
      // عشان هنعماه في راوت مخصوص لوحده
    },
    {
      new: true,
    },
  );
  if (!document) {
    // res.status(404).json({ msg: `No category For this ${id}` });
    return next(new ApiError(`No category For this ${id}`, 404));
  }

  res.status(200).json({data: document});
});

exports.changeUserPassword = asyncHandler(async (req, res, next) => {
  const document = await User.findByIdAndUpdate(
    req.params.id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
      // عملنا دي عشان التوكنز
    },
    {
      new: true,
    },
  );
  if (!document) {
    return next(new ApiError(`No category For this ${id}`, 404));
  }

  res.status(200).json({data: document});
});
//  @desc Delete specific user
//  @route DELETE /api/v1/users/:id
// @access Private

exports.deleteUser = factory.deleteOne(User);

//this part for the folder in postman that called (LoggedUser)
// @desc get myData (getlogged user data)
// @route GET /api/va/users/getMe
// access Private/protect
exports.getLoggedUserData = asyncHandler(async (req, res, next) => {
  req.params.id = req.user._id;
  next();
});

// @desc update logged User password
// @route PUT /api/va/users/updateMyPassword
// access Private/protect
exports.updateLoggedUserPassword = asyncHandler(async (req, res, next) => {
  // مش هنعمل دي زي اللي فوق عشان هنا محتاجين ننشئ توكين جديد عشان هنا الباس بيتغير
  // 1) update user password based on user payload(req.user._id)
  const user = await User.findByIdAndUpdate(
    req.user._id,
    {
      password: await bcrypt.hash(req.body.password, 12),
      passwordChangeAt: Date.now(),
      // عملنا دي عشان التوكنز
    },
    {
      new: true,
    },
  );
  // 2) generate Token

  // =======before refactoring:=
  //   const token = JWT.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
  //     expiresIn: process.env.JWT_EXPIRE_TIME,
  //   });
  //   res.status(200).json({data: user, token});
  // });

  // =======After refactoring:=
  const token = createToken(user._id);
  res.status(200).json({data: user, token});
});

// @desc update logged User data (without password, rule)
// @route PUT /api/va/users/updateMe
// access Private/protect
exports.updateLoggedUserData = asyncHandler(async (req, res, next) => {
  const updatedUser = await User.findByIdAndUpdate(
    req.user.id,
    {
      name: req.body.name,
      email: req.body.email,
      phone: req.body.phone,
    },
    {new: true},
  );
  res.status(200).json({data: updatedUser});
});

// @desc Deactivate logged User
// @route DELETE /api/va/users/deleteMe
// access Private/protect

exports.deleteLoggedUser = asyncHandler(async (req, res, next) => {
  await User.findByIdAndUpdate(req.user._id, {active: false});
  res.status(204).json({status: "success"});
});

// ---------------------------------------------------------

// // فيديو 106
// // ده كان شكلها قبل ما نفصل الجزء بتاع ابديت الباسورد لوحده
// // exports.updateUser = factory.updateOne(User);
// // ---- وده شكلها بعد
// exports.updateUser = asyncHandler(async (req, res, next) => {
//   const document = await User.findByIdAndUpdate(
//     req.params.id,
//     {
//       // هنحدد الداتا اللي هيتعملها ابديت مش البودي كله زي قبل كده
//       name: req.body.name,
//       slug: req.body.slug,
//       phone: req.body.phone,
//       email: req.body.email,
//       profileImg: req.body.profileImg,
//       role: req.body.role,
//       // يعني كل الداتا معدا الباسورد
//       // البساورد بقى هنعملها راوت لوحدها اللي تحت ده
//     },
//     {
//       new: true,
//     }
//   );
//   if (!document) {
//     // res.status(404).json({ msg: `No category For this ${id}` });
//     return next(new ApiError(`No category For this ${id}`, 404));
//   }

//   res.status(200).json({data: document});
// });

// exports.changeUserPassword = asyncHandler(async (req, res, next) => {
//   const document = await User.findByIdAndUpdate(
//     req.params.id,
//     {
//       password: await bcrypt.hash(req.body.password, 12),
//     },
//     {
//       new: true,
//     }
//   );
//   if (!document) {
//     // res.status(404).json({ msg: `No category For this ${id}` });
//     return next(new ApiError(`No category For this ${id}`, 404));
//   }

//   res.status(200).json({data: document});
// });

// //  @desc Delete specific user
// //  @route DELETE /api/v1/users/:id
// // @access Private

// exports.deleteUser = factory.deleteOne(User);
