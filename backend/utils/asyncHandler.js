/**
 * Wraps an async route handler so any thrown error (or rejected promise)
 * is automatically forwarded to next(err) instead of needing a
 * try/catch in every single controller.
 *
 * Usage: router.post("/x", asyncHandler(async (req, res) => { ... }))
 */
const asyncHandler = (fn) => (req, res, next) => {
  Promise.resolve(fn(req, res, next)).catch(next);
};

module.exports = asyncHandler;