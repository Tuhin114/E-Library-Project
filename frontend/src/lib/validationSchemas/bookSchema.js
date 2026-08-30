import { z } from 'zod';

const currentYear = new Date().getFullYear();

/**
 * Mirrors backend/src/validators/bookValidator.js field-for-field.
 * `authors` is a multi-select of Category-style ObjectId strings.
 * `tags` is edited as a comma-separated string in the UI and transformed
 * into an array here so the payload matches the API contract exactly.
 */
export const bookSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(300, 'Title cannot exceed 300 characters'),
  subtitle: z.string().trim().max(300).optional().or(z.literal('')),
  isbn: z.string().trim().min(10, 'Enter a valid ISBN').max(20, 'Enter a valid ISBN'),
  description: z.string().trim().max(3000).optional().or(z.literal('')),
  language: z.string().trim().min(1, 'Language is required'),
  edition: z.string().trim().max(50).optional().or(z.literal('')),
  publicationYear: z.coerce
    .number()
    .int()
    .min(1000, 'Enter a valid publication year')
    .max(currentYear, 'Publication year cannot be in the future')
    .optional(),
  numberOfPages: z.coerce.number().int().min(1, 'Number of pages must be at least 1').optional(),
  // M3 (Phase 7) — prefills a damage/lost fee's amount; falls back to
  // the library's own default when left unset.
  replacementCost: z.coerce.number().min(0, 'Must be 0 or more').max(5000).optional(),
  category: z.string({ required_error: 'Category is required' }).min(1, 'Category is required'),
  authors: z.array(z.string()).min(1, 'Select at least one author'),
  publisher: z.string({ required_error: 'Publisher is required' }).min(1, 'Publisher is required'),
  tagsInput: z.string().optional().or(z.literal('')),
  visibility: z.enum(['public', 'restricted']),
  status: z.enum(['draft', 'published', 'archived']),
});

/**
 * Converts the form's `tagsInput` (comma-separated) into the `tags` array
 * the API expects, and strips the UI-only field before submission.
 */
export const toBookPayload = (formValues) => {
  const { tagsInput, ...rest } = formValues;
  const tags = (tagsInput || '')
    .split(',')
    .map((tag) => tag.trim())
    .filter(Boolean);

  return { ...rest, tags };
};
