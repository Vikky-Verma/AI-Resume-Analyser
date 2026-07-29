/**
 * Custom error class for expected/operational errors (bad input,
 * not found, unauthorized, etc.) — as opposed to unexpected bugs.
 * Throw this anywhere in a controller/service and the global error
 * handler will format the response correctly.
 */
class AppError extends Error {
  constructor(message, statusCode) {
    super(message);
    this.statusCode = statusCode;
    this.isOperational = true; // distinguishes "expected" errors from real bugs
    Error.captureStackTrace(this, this.constructor);
  }
}

module.exports = AppError;