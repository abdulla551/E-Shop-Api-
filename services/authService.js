const crypto = require("crypto");

const asyncHandler = require("express-async-handler");
const ApiError = require("../utils/apiError");
const JWT = require("jsonwebtoken");
const bcrypt = require("bcryptjs");
const User = require("../models/userModel");
const sendEmail = require("../utils/sendEmail");
const createToken = require("../utils/createToken");
// @desc SignUp
// @route GET /api/v1/signUP
// @access Public
exports.signup = asyncHandler(async (req, res, next) => {
  // 1-create user
  const user = await User.create({
    name: req.body.name,
    email: req.body.email,
    password: req.body.password,
  });

  // 2-generate token
  const token = JWT.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });

  res.status(201).json({data: user, token});
});

// @desc login
// @route GET /api/v1/login
// @access Public
exports.login = asyncHandler(async (req, res, next) => {
  // 1-check if password and email in body (will do this step in validation Layer)
  //   2-check if user exists, if password correct
  const user = await User.findOne({email: req.body.email});
  if (!user || !(await bcrypt.compare(req.body.password, user.password))) {
    return next(new ApiError("Incorrect Email or Password", 401));
  }
  //   3-generate Token
  const token = JWT.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  //   then send response to client side
  res.status(200).json({data: user, token});
});

// @desc: make sure the user is logged in
exports.protect = asyncHandler(async (req, res, next) => {
  // 1-check if Token exists , if exist hold it
  //   console.log(req.headers);
  let token;
  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    token = req.headers.authorization.split(" ")[1];
    console.log(token);
  }
  if (!token) {
    return next(
      new ApiError("You are not logged in, please Login to get Access", 401),
    );
  }

  // 2-verify Token(check no change happen or expired Token)
  const decoded = JWT.verify(token, process.env.JWT_SECRET_KEY);
  console.log(decoded);
  // بيرجع ال داتا اوالبايلود بتاع التوكن

  // 3-check if user still exists
  const currentUser = await User.findById(decoded.userId);
  if (!currentUser) {
    return next(
      new ApiError(
        "the User that belong to this token does no longer Exist",
        401,
      ),
    );
  }

  // 4-check if user change his password after Token created
  if (currentUser.passwordChangeAt) {
    const passwordChangeTimeStamp = parseInt(
      currentUser.passwordChangeAt.getTime() / 1000,
      10,
    );
    // console.log(passwordChangeTimeStamp, decoded.iat);
    if (passwordChangeTimeStamp > decoded.iat) {
      // this mean pass changed after token created
      return next(
        new ApiError("user recently changed his password , please Login Agian"),
      );
    }
  }
  req.user = currentUser;
  next();

  console.log("Authorization:", req.headers.authorization);
  console.log("Token:", token);
  console.log("Secret:", process.env.JWT_SECRET_KEY);
});

// @desc:(Authorization) give the access to admin and manager and to be allowed to do changes in some routes
// rest params will come to us as a array of elemnts that we pass to the function in Route , like : ['admin', 'manager']
exports.allowedTo = (...roles) =>
  asyncHandler(async (req, res, next) => {
    // 1) access roles : we do it through the params passed above (rest params)
    //2) access registered user : to compare his roles with the role that come from the router
    // note: we can do last step by: req.user.roles
    // لاننا قايلين انه لازم اليوزر الاول نتاكد اذا كان عامل لوج ان وده اللي عملناه في بروتيكت ف عشان نكمل بعده كتبنا في اخر البروتيكيت req.user
    if (!roles.includes(req.user.role)) {
      return next(
        new ApiError("You are not allowed To access this Route", 403),
      );
    }
    next();
  });
// ==========================

// ================= 1========================
//  3 phases of forgot password (1- send code to email)
// @desc forgotPassword
// @route Post /api/v1/auth/login
// @access Public
exports.forgotPassword = asyncHandler(async (req, res, next) => {
  // 1)get User by Email
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(
      new ApiError(`No user for this email : ${req.body.email}`, 404),
    );
  }
  // 2)if user exists generate reset random 6-digits and save it in DB
  const resetCode = Math.floor(100000 + Math.random() * 900000).toString();
  // to string : عشان نعمله انكريبت قبل ما نحفظه في db

  const hashedResetCode = crypto
    .createHash("sha256")
    .update(resetCode)
    .digest("hex");
  console.log("ResetCode:", resetCode);
  console.log("HashedResetCode:", hashedResetCode);

  // save Hashed Reset Code in DB
  user.passwordResetCode = hashedResetCode;
  //add Expiration time for pass reset code
  user.passwordResetExpires = Date.now() + 10 * 60 * 1000;
  user.passwordResetVerified = false;
  await user.save();

  const message = `Hi ${user.name}, \n We received a request to reset Your password on E-shop Account.\n
${resetCode}\n Enter this code to complete the reset\n
thank you ,\nE-shop team`;
  // 3)send the reset Code via Email
  try {
    await sendEmail({
      email: user.email,
      subject: "Your Password Reset Code (Valid For ten minute)",
      message: message,
    });
  } catch (err) {
    user.passwordResetCode = undefined;
    user.passwordResetExpires = undefined;
    user.passwordResetVerified = undefined;
    await user.save();
    return next(new ApiError("there is an error in sending email", 500));
  }
  res
    .status(200)
    .json({status: "success", message: "reset code sent to email"});
});

// ================= 2 ========================
//  3 phases of forgot password (2- verify reset code that sent to email)
// @desc verify Password Reset Code
// @route Post /api/v1/auth/verifyResetCode
// @access Public
exports.verifyPasswordResetCode = asyncHandler(async (req, res, next) => {
  // 1)get user based on reset Code
  // بس الاول هنعمل هاش للريسيت كود اللي مبعوت عشان لما نقارنهم ببعض
  const hashedResetCode = crypto
    .createHash("sha256")
    .update(req.body.resetCode)
    .digest("hex");

  const user = await User.findOne({
    passwordResetCode: hashedResetCode,
    passwordResetExpires: {$gt: Date.now()},
  });
  if (!user) {
    return next(new ApiError("Reset Code invalid or Expired"));
  }
  // 2) if the reset code is valid :
  user.passwordResetVerified = true;
  await user.save();

  res.status(200).json({status: "Success"});
});

// ================= 3 ========================
//  3 phases of forgot password (3- set the new password)
// @desc Reset password
// @route Post /api/v1/auth/resetPassword
// @access Public
exports.resetPassword = asyncHandler(async (req, res, next) => {
  // 1) get User based on email  : عشان نتاكد ان الفيريفي
  // معمولة ب ترو
  const user = await User.findOne({email: req.body.email});
  if (!user) {
    return next(
      new ApiError(`there is no user for this Email : ${req.body.email}`, 404),
    );
  }
  // 2)check if reset code verified
  if (!user.passwordResetVerified) {
    return next(new ApiError("reset Code not verified yet", 400));
  }
  user.password = req.body.newPassword;

  user.passwordResetCode = undefined;
  user.passwordResetExpires = undefined;
  user.passwordResetVerified = undefined;

  await user.save();

  // 3)if everything is ok generate new token for this user
  const token = JWT.sign({userId: user._id}, process.env.JWT_SECRET_KEY, {
    expiresIn: process.env.JWT_EXPIRE_TIME,
  });
  res.status(200).json({token});
});
