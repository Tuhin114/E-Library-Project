import { registerRepeatableJobs } from "./registerRepeatableJobs.js";

/**
 * Called once from server.js after DB + Socket.io are ready. This no
 * longer runs the sweeps itself — it just tells Redis/BullMQ the
 * schedule. The actual sweeps run in the separate worker process
 * (src/jobs/worker.js), started as its own Render service.
 */
export const startJobs = async () => {
  await registerRepeatableJobs();
};
