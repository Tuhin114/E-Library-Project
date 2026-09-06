import { Queue } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";

export const loanDueReminderQueue = new Queue("loan-due-reminder", {
  connection: redisConnection,
});
export const waitlistExpiryQueue = new Queue("waitlist-expiry", {
  connection: redisConnection,
});
