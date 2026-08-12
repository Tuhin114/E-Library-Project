/**
 * Parses page/limit from raw query params (already validated as numbers by
 * bookQuerySchema before this runs) into safe, bounded values, and derives
 * the skip offset for a Mongo query.
 */
export const getPaginationParams = (
  query,
  { defaultLimit = 20, maxLimit = 100 } = {},
) => {
  const page = Math.max(parseInt(query.page, 10) || 1, 1);
  const limit = Math.min(
    Math.max(parseInt(query.limit, 10) || defaultLimit, 1),
    maxLimit,
  );
  const skip = (page - 1) * limit;

  return { page, limit, skip };
};

/**
 * Builds the pagination metadata block returned alongside a paginated list,
 * so the frontend never has to re-derive totalPages/hasNextPage itself.
 */
export const buildPaginationMeta = ({ page, limit, totalItems }) => {
  const totalPages = Math.max(Math.ceil(totalItems / limit), 1);

  return {
    page,
    limit,
    totalItems,
    totalPages,
    hasNextPage: page < totalPages,
    hasPrevPage: page > 1,
  };
};
