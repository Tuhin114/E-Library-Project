import slugify from "slugify";

/**
 * Generates a URL-safe slug from a given string (e.g. a name/title).
 */
export const generateSlug = (text) => {
  return slugify(text, {
    lower: true,
    strict: true, // strips special characters
    trim: true,
  });
};

/**
 * Appends a short random suffix to resolve slug collisions.
 */
export const appendSlugSuffix = (baseSlug) => {
  const suffix = Math.random().toString(36).substring(2, 7);
  return `${baseSlug}-${suffix}`;
};
