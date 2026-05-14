const errorMiddleware = (err, req, res, next) => {
  const isSequelizeValidation =
    err.name === "SequelizeValidationError" || err.name === "SequelizeUniqueConstraintError";

  const isSequelizeDb = err.name === "SequelizeDatabaseError";
  const isUnknownColumn =
    isSequelizeDb &&
    (err.parent?.code === "ER_BAD_FIELD_ERROR" ||
      err.original?.code === "ER_BAD_FIELD_ERROR" ||
      err.parent?.errno === 1054 ||
      err.original?.errno === 1054);

  const statusCode = isSequelizeValidation ? 400 : err.statusCode || err.status || 500;
  const exposeMessage = err.isOperational || isSequelizeValidation || isUnknownColumn;
  const response = {
    message: statusCode >= 500 && !exposeMessage ? "Internal Server Error" : err.message,
  };

  if (isUnknownColumn) {
    response.message =
      "The database is missing required columns (e.g. password_change_token_*). Run the SQL in server/sql/add_password_change_columns.sql on this database, or set DB_SYNC_ALTER=true once in a safe environment.";
  }

  if (err.code && (statusCode < 500 || err.isOperational)) {
    response.code = err.code;
  }

  if (err.details && (statusCode < 500 || err.isOperational)) {
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

  // Local debugging: MySQL errors often lack err.code on the outer Error; show sqlMessage in JSON.
  if (
    statusCode >= 500 &&
    isSequelizeDb &&
    process.env.NODE_ENV !== "production" &&
    !isUnknownColumn
  ) {
    const sqlMsg = err.parent?.sqlMessage || err.original?.sqlMessage;
    if (sqlMsg) {
      response.message = sqlMsg;
      if (err.parent?.code) response.code = err.parent.code;
    }
  }

  return res.status(statusCode).json(response);
};

module.exports = errorMiddleware;
