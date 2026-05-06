const errorMiddleware = (err, req, res, next) => {
  const isSequelizeValidation =
    err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError";

  const statusCode = isSequelizeValidation ? 400 : err.statusCode || err.status || 500;
  const response = {
    message: statusCode >= 500 ? "Internal Server Error" : err.message,
  };

  if (err.code && statusCode < 500) {
    response.code = err.code;
  }

  if (err.details && statusCode < 500) {
    response.details = err.details;
  }

  if (isSequelizeValidation) {
    response.code = "DATABASE_VALIDATION_ERROR";
    response.details = err.errors?.map((error) => ({
      field: error.path,
      message: error.message,
    }));
  }

  if (statusCode >= 500) {
    console.error(err);
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
