import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../generated/prisma/client/client.js";

const connectionString = `${process.env.DATABASE_URL}`;
console.log("test"+process.env.DATABASE_URL)
const adapter = new PrismaPg({ connectionString });
const prisma = new PrismaClient({ adapter });

export { prisma };