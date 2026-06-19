import { verifyToken } from '../shared/utils/jwtToken.js';
import ApiError from '../shared/errors/ApiError.js';
import * as userModel from '../features/auth/user.model.js';

/**
 * Protects routes by validating JWT Bearer token in headers.
 */
export const protect = async (req, res, next) => {
  try {
    let token;

    // Read Bearer token from Authorization header
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return next(
        new ApiError(
          401,
          "You are not logged in. Please log in to gain access.",
        ),
      );
    }

    // Verify token
    const decoded = verifyToken(token);

    // Fetch user details from Database to ensure user still exists
    const user = await userModel.findById(decoded.id);
    if (!user) {
      return next(
        new ApiError(
          401,
          "The account belonging to this session token no longer exists.",
        ),
      );
    }

    // Attach authenticated user to request context
    req.user = user;
    next();
  } catch (err) {
    next(err);
  }
};

/**
 * Restricts access to specific role tiers (e.g. admin).
 * @param {...String} roles - Array of permitted roles
 */
export const restrictTo = (...roles) => {
  return (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return next(
        new ApiError(
          403,
          "Access denied. You do not have permissions to perform this action.",
        ),
      );
    }
    next();
  };
};
