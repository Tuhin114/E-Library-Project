import { ApiError } from "../utils/ApiError.js";

export const validateQuery = (schema) => (req, res, next) => {
  const result = schema.safeParse(req.query);

  if (!result.success) {
    const details = result.error.issues.map((issue) => ({
      field: issue.path.join("."),
      message: issue.message,
    }));

    return next(new ApiError(422, "Validation failed", details));
  }

  // Replace query values with parsed/coerced values
  req.query = result.data;

  next();
};
