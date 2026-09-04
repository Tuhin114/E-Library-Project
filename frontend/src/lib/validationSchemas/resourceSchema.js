import { z } from 'zod';
import { RESOURCE_TYPE_VALUES } from '../../constants/resourceType';
import { RESOURCE_VISIBILITY_VALUES } from '../../constants/resourceVisibility';

/**
 * Mirrors backend/src/validators/resourceValidator.js field-for-field.
 * `authorsInput`/`tagsInput` are edited as comma-separated strings in
 * the UI and transformed into arrays here, the same convention
 * bookSchema uses for `tagsInput`.
 */
export const resourceSchema = z.object({
  title: z
    .string()
    .trim()
    .min(1, 'Title is required')
    .max(300, 'Title cannot exceed 300 characters'),
  description: z.string().trim().max(2000).optional().or(z.literal('')),
  resourceType: z.enum(RESOURCE_TYPE_VALUES, {
    required_error: 'Resource type is required',
  }),
  subject: z.string().trim().max(100).optional().or(z.literal('')),
  authorsInput: z.string().optional().or(z.literal('')),
  tagsInput: z.string().optional().or(z.literal('')),
  visibility: z.enum(RESOURCE_VISIBILITY_VALUES),
});

const splitCommaList = (value) =>
  (value || '')
    .split(',')
    .map((item) => item.trim())
    .filter(Boolean);

/**
 * Converts the form's `authorsInput`/`tagsInput` (comma-separated) into
 * the `authors`/`tags` arrays the API expects.
 */
export const toResourcePayload = (formValues) => {
  const { authorsInput, tagsInput, ...rest } = formValues;
  return {
    ...rest,
    authors: splitCommaList(authorsInput),
    tags: splitCommaList(tagsInput),
  };
};
