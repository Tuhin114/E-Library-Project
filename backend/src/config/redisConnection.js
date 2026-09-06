import IORedis from "ioredis";

export const redisConnection = new IORedis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // required by BullMQ
});

redisConnection.on("connect", () => console.log("[redis] connected"));
redisConnection.on("error", (err) =>
  console.error("[redis] error:", err.message),
);
