import nodemailer from "nodemailer";
import { env } from "../config/env.js";

const isEmailConfigured = Boolean(
  env.email.host && env.email.user && env.email.pass,
);

const transporter = isEmailConfigured
  ? nodemailer.createTransport({
      host: env.email.host,
      port: env.email.port,
      secure: env.email.port === 465,
      auth: { user: env.email.user, pass: env.email.pass },
    })
  : null;

/**
 * Sends the password-reset email.
 *
 * Falls back to logging the reset link to the console when SMTP
 * credentials aren't configured (EMAIL_HOST/EMAIL_USER/EMAIL_PASS) —
 * keeps local development unblocked without requiring real mail
 * provider credentials just to exercise this flow. In any real
 * deployment those env vars must be set, or password resets will
 * silently only log a link no one but the server operator can see.
 */
export const sendPasswordResetEmail = async (user, resetUrl) => {
  if (!isEmailConfigured) {
    console.log(
      `[emailService] SMTP not configured — password reset link for ${user.email}:`,
    );
    console.log(resetUrl);
    return;
  }

  await transporter.sendMail({
    from: env.email.from,
    to: user.email,
    subject: "Reset your E-Library password",
    html: `
      <p>Hi ${user.name},</p>
      <p>You requested a password reset. This link expires in 10 minutes:</p>
      <p><a href="${resetUrl}">${resetUrl}</a></p>
      <p>If you didn't request this, you can safely ignore this email — your password will stay unchanged.</p>
    `,
  });
};

/**
 * Generic notification email — used by notificationService.notify()
 * for every category/type rather than each event having its own
 * template. Same SMTP-not-configured console fallback as the
 * password-reset email above, so notification delivery never blocks
 * on local dev setup either.
 */
export const sendNotificationEmail = async (user, { title, message, link }) => {
  if (!isEmailConfigured) {
    console.log(
      `[emailService] SMTP not configured — notification email for ${user.email}: ${title}`,
    );
    return;
  }

  const linkHtml = link
    ? `<p><a href="${env.clientUrl}${link}">View in E-Library</a></p>`
    : "";

  await transporter.sendMail({
    from: env.email.from,
    to: user.email,
    subject: title,
    html: `
      <p>Hi ${user.name},</p>
      <p>${message}</p>
      ${linkHtml}
    `,
  });
};
