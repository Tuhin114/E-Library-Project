/**
 * Canonical list of user roles — mirrors backend/src/constants/roles.js.
 * The two are kept in sync manually since frontend and backend are
 * separate packages; update both files together if roles ever change.
 */
export const ROLES = Object.freeze({
  STUDENT: 'student',
  FACULTY: 'faculty',
  LIBRARIAN: 'librarian',
});

export const ROLE_VALUES = Object.values(ROLES);

export const ROLE_LABELS = Object.freeze({
  [ROLES.STUDENT]: 'Student',
  [ROLES.FACULTY]: 'Faculty',
  [ROLES.LIBRARIAN]: 'Librarian',
});
