import { loanDueReminderQueue, waitlistExpiryQueue } from "./queue.js";

export const registerRepeatableJobs = async () => {
  await loanDueReminderQueue.add(
    "daily-sweep",
    {},
    {
      repeat: { pattern: "0 7 * * *" }, // matches your original 07:00 schedule
      jobId: "loan-due-reminder-daily",
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  );

  await waitlistExpiryQueue.add(
    "expiry-sweep",
    {},
    {
      repeat: { every: 15 * 60 * 1000 }, // matches your original */15 schedule
      jobId: "waitlist-expiry-15min",
      removeOnComplete: 50,
      removeOnFail: 50,
    },
  );

  console.log("[jobs] repeatable jobs registered");
};
