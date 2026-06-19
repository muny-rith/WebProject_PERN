/**
 * Centralized Express Error Handling Middleware.
 * Captures all operational errors and responds with standard JSON bodies.
 */
export const errorMiddleware = (err, req, res, next) => {
  err.statusCode = err.statusCode || 500;
  err.status = err.status || "error";

  // Handle specific PostgreSQL DB errors
  let error = { ...err };
  error.message = err.message;

  // 23505: PostgreSQL Unique key violation (e.g., duplicate email)
  if (err.code === "23505") {
    error.statusCode = 400;
    error.status = 'fail';
    error.message = 'An account with this email address already exists.';
  }

  // 22P02: PostgreSQL Invalid text representation (e.g., passing string instead of integer ID)
  if (err.code === "22P02") {
    error.statusCode = 400;
    error.status = "fail";
    error.message = "Invalid item format or resource identifier.";
  }

  // JWT Errors
  if (err.name === "JsonWebTokenError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Invalid authentication token. Please log in again.";
  }

  if (err.name === "TokenExpiredError") {
    error.statusCode = 401;
    error.status = "fail";
    error.message = "Session expired. Please log in again.";
  }

  // Development vs Production error detail
  const isDev = process.env.NODE_ENV === "development";

  res.status(error.statusCode).json({
    status: error.status,
    message: error.message,
    ...(isDev && { stack: err.stack }),
  });
};
