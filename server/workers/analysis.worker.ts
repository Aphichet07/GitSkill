import { Worker } from "bullmq";
import path from "path";
import { fileURLToPath } from "url";
import { redisConnection } from "../lib/redis.js";
import analysisProcessor from "./analysis.processor.js";
import mongoose from "mongoose";
// run npx tsx --env-file=.env workers/analysis.worker.ts ด้วยคำสั่งนี้

const initializeWorker = async () => {
  try {
    const mongoUri = process.env.MONGO_URL || process.env.DATABASE_URL;
    if (!mongoUri) throw new Error("ไม่พบ MONGODB_URI ในไฟล์ .env");
    
    await mongoose.connect(mongoUri);
    console.log("📦 MongoDB Connected for Worker!");

    const worker = new Worker("ProjectAnalysisQueue", analysisProcessor, {
      connection: redisConnection,
      concurrency: 2,
      lockDuration: 5 * 60 * 1000,
    });

    worker.on("active", (job) => {
      console.log(`⏳ [ACTIVE] Worker picked up Job ${job.id}`);
    });

    worker.on("completed", (job) => {
      console.log(`✅ [SUCCESS] Job ${job.id} completed!`);
    });

    worker.on("failed", (job, err) => {
      console.error(`❌ [FAILED] Job ${job?.id} failed:`, err.message);
    });

    const shutdown = async () => {
      console.log("\n🛑 Shutting down worker gracefully...");
      await worker.close();
      await mongoose.disconnect(); 
      process.exit(0);
    };
    process.on("SIGTERM", shutdown);
    process.on("SIGINT", shutdown);

  } catch (err) {
    console.error("💥 Failed to start worker:", err);
    process.exit(1);
  }
};

initializeWorker();