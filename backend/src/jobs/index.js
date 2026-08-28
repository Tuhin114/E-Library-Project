import { startLoanDueReminderJob } from "./loanDueReminderJob.js";

/**
 * Starts every scheduled job. Called once from server.js, after the
 * DB connection and Socket.io are both ready (jobs write Notifications
 * and push over sockets, so both dependencies must already be up).
 *
 * Documented limitation, stated up front: these jobs run inside this
 * single Node process via node-cron. That's fine at this project's
 * scale, but a real multi-instance deployment would run this same job
 * on every instance and double-send reminders — a proper job queue
 * (BullMQ/Redis) is the real fix, not in scope here.
 */
export const startJobs = () => {
  startLoanDueReminderJob();
};
