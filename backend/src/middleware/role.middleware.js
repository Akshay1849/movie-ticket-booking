const requireRoles = (...allowedRoles) => (req, res, next) => {
  if (!req.user || !allowedRoles.includes(req.user.role)) {
    const error = new Error("You do not have permission to access this resource");
    error.statusCode = 403;
    return next(error);
  }

  return next();
};

export default requireRoles;