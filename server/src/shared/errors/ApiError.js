/**
 * Custom API Error class to handle express request errors in a clean, structured format.
 */
class ApiError extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.status = `${statusCode}`.startsWith('4') ? 'fail' : 'error';
    this.isOperational = true; // Flag for known handled errors

    Error.captureStackTrace(this, this.constructor);
  }
}

export default ApiError;
