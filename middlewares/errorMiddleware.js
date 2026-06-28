// const globalErrorHandle = (err,req,res,next)=>{
// err.statusCode = err.statusCode || 500
// err.status = err.status || "error"
// res.status(err.statusCode).json({
//   error:err,
//   status:err.status,
//   message:err.message,
//   stack:err.stack
// })
// }

const ApiError = require("../utils/apiError");

// module.exports = globalErrorHandle

const handleJwtInvalidSignature = () =>
  new ApiError("Invalid Token, please Login AGAin!", 401);
const handleJwtExpired = () =>
  new ApiError("Expired Token, please Login AGAin!", 401);

const globalErrorHandle = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";
  if (process.env.NODE_ENV === "development") {
    sendErrorForDev(err, res);
  } else {
    if (err.name === "JsonWebTokenError") {
      err = handleJwtInvalidSignature();
    }
    if (err.name === "TokenExpiredError") {
      err = handleJwtExpired();
    }
    sendErrorForProd(err, res);
  }
};

const sendErrorForDev = (err, res) => {
  return res.status(err.statusCode).json({
    error: err,
    status: err.status,
    message: err.message,
    stack: err.stack,
  });
};
const sendErrorForProd = (err, res) => {
  return res.status(err.statusCode).json({
    status: err.status,
    message: err.message,
  });
};

module.exports = globalErrorHandle;
