const AppError = require("../utils/AppError");

const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return next(new AppError("Authentication is required", 401, "UNAUTHORIZED"));
      }

      if (!allowedRoles.includes(req.user.role)) {
        return next(new AppError("Forbidden: access denied", 403, "FORBIDDEN"));
      }

      return next();
    } catch (error) {
      return next(error);
    }
  };
};

module.exports = roleMiddleware;
