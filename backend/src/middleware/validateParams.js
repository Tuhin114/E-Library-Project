import { ApiError } from "../utils/ApiError.js";

export const validateParams = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.params);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return next(new ApiError(422, "Validation failed", details));
  }

  req.params = result.data;
  next();
};
