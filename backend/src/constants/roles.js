/**
 * Canonical list of user roles used across the application.
 * Kept in one place so role checks (RBAC middleware) and the Mongoose
 * enum validation on the User model never drift out of sync.
 */
export const ROLES = Object.freeze({
  STUDENT: 'student',
  FACULTY: 'faculty',
  LIBRARIAN: 'librarian',
});

export const ROLE_VALUES = Object.values(ROLES);
