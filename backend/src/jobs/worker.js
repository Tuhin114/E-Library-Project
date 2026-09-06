import "dotenv/config";
import express from "express";
import { Worker } from "bullmq";
import { redisConnection } from "../config/redisConnection.js";
import { connectDatabase } from "../database/connection.js";
import { runLoanDueReminderSweep } from "./loanDueReminderJob.js";
import { runWaitlistExpirySweep } from "./waitlistExpiryJob.js";

(async () => {
  await connectDatabase();

  new Worker(
    "loan-due-reminder",
    async () => {
      const result = await runLoanDueReminderSweep();
      console.log("[worker] loan-due-reminder result:", result);
    },
    { connection: redisConnection },
  );

  new Worker(
    "waitlist-expiry",
    async () => {
      const result = await runWaitlistExpirySweep();
      console.log("[worker] waitlist-expiry result:", result);
    },
    { connection: redisConnection },
  );

  console.log("[worker] BullMQ workers started and listening");

  // Render's free "Web Service" tier requires binding to a port and
  // responding to HTTP — this Express app exists ONLY to satisfy that
  // requirement and to give an external pinger something to hit. It
  // does no real work itself; the BullMQ Workers above do everything.
  const app = express();
  const PORT = process.env.PORT || 10000;

  app.get("/", (req, res) => {
    res.status(200).json({ status: "worker alive", uptime: process.uptime() });
  });

  app.listen(PORT, () => {
    console.log(`[worker] health endpoint listening on port ${PORT}`);
  });
})();
