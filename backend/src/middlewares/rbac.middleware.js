import AppError from "../utils/appError.js";

export const authorizeRoles = (...allowedRoles) => {
  if (!allowedRoles || allowedRoles.length === 0) throw new AppError("RBAC misconfiguration: no roles specified",500);

  return (req, res, next) => {
    
    if (!req.user) return next(new AppError("Access denied", 403));

    if (!allowedRoles.includes(req.user.role)) return next(new AppError("You do not have permission to perform this action", 403));

    next();
  };
};