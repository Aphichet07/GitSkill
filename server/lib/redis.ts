import { Redis } from "ioredis";
import type {RedisOptions} from "ioredis"

console.log("🔄 Initializing Redis connection to Docker...");

const bullmqOptions: RedisOptions = {
  host: "127.0.0.1",
  port: 6379,
  maxRetriesPerRequest: null,
};

export const redisConnection = new Redis(bullmqOptions);

redisConnection.on("error", (err) => {
  console.error("❌ Redis Error:", err.message);
});

redisConnection.on("ready", () => {
  console.log("✅ Redis Queue Connected Successfully!");
});
