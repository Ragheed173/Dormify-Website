const roleMiddleware = (...allowedRoles) => {
  return (req, res, next) => {
    try {
      if (!req.user) {
        return res.status(401).json({
          message: "Unauthorized",
        });
      }

      if (!allowedRoles.includes(req.user.role)) {
        return res.status(403).json({
          message: "Forbidden: access denied",
        });
      }

      next();
    } catch (error) {
      return res.status(500).json({
        message: "Server error in role middleware",
        error: error.message,
      });
    }
  };
};

module.exports = roleMiddleware;