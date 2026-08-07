/**
 * Wraps an async Express route handler and forwards any rejected
 * promise to next(). Without this, every controller would need its
 * own try/catch to avoid unhandled promise rejections crashing the
 * process or bypassing the global error handler.
 */
export const asyncHandler = (handler) => (req, res, next) => {
  Promise.resolve(handler(req, res, next)).catch(next);
};
