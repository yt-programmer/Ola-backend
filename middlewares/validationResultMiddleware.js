const { validationResult } = require("express-validator");

const httpStatus = require("../utils/httpStatus");
const AppError = require("../utils/appError");

const validationResultMiddleware = (req, res, next) => {
  const results = validationResult(req);
  if (!results.isEmpty()) {
    return next(
      new AppError(
        results
          .array()
          .map((err) => err.msg)
          .join(", "),
        400,
        httpStatus.FAIL,
      ),
    );
  }
  next();
};

module.exports = validationResultMiddleware;
