import crypto from "crypto";

/**
 * Generates a password-reset token pair:
 * - `resetToken`: the raw, random value emailed to the user — never
 *   stored anywhere, only ever exists in transit and in their inbox.
 * - `hashedToken`: SHA-256 hash of the raw token, stored on the User
 *   document instead. This means a database leak alone can't be used
 *   to reset anyone's password — the raw token is still required, and
 *   that only ever lived in the email.
 */
export const generateResetToken = () => {
  const resetToken = crypto.randomBytes(32).toString("hex");
  const hashedToken = crypto
    .createHash("sha256")
    .update(resetToken)
    .digest("hex");
  const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

  return { resetToken, hashedToken, expiresAt };
};

/**
 * Hashes a raw token the same way, so an incoming token from a reset
 * link can be looked up against the stored hash.
 */
export const hashResetToken = (rawToken) =>
  crypto.createHash("sha256").update(rawToken).digest("hex");
