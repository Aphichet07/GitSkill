import { Redis } from "ioredis";
import type { RedisOptions } from "ioredis";

console.log("🔄 Initializing Redis connection...");

const REDIS_URL = process.env.REDIS_URL || "redis://127.0.0.1:6379";

const bullmqOptions: RedisOptions = {
  maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(REDIS_URL, bullmqOptions);

redisConnection.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisConnection.on("ready", () => {
  console.log("✅ Redis Queue Connected Successfully!");
});