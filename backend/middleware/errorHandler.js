/**
 * Global error handler — must be registered LAST, after all routes,
 * in index.js: app.use(errorHandler)
 *
 * Any error passed to next(err), or thrown inside an async route handler
 * wrapped by asyncHandler, ends up here instead of crashing the process
 * or leaking a raw stack trace to the client.
 */
const errorHandler = (err, req, res, next) => {
  const statusCode = err.statusCode || 500;
  const isOperational = err.isOperational === true;

  // Log full detail server-side always
  console.error(`[${req.method} ${req.originalUrl}]`, err);

  res.status(statusCode).json({
    success: false,
    message: isOperational
      ? err.message
      : "Something went wrong. Please try again.",
    // Only leak stack traces outside production, and only for real bugs
    ...(process.env.NODE_ENV !== "production" && !isOperational
      ? { stack: err.stack }
      : {}),
  });
};

module.exports = errorHandler;