import { PrismaClient } from "./generated/prisma";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

// Fix: Ensure the database path is correctly resolved for SQLite on Windows
// Next.js loads .env.local and .env, but DATABASE_URL may use relative path "file:./prisma/dev.db"
// We need to convert this to an absolute path that works on Windows
const dbUrl = process.env.DATABASE_URL;

// Convert file:./prisma/dev.db to file:/D:/SawahluntoFor-Press/prisma/dev.db
// On Windows, SQLite needs absolute paths with forward slashes in file: URLs
const prismaUrl = dbUrl
  ? dbUrl.startsWith("file:")
    ? dbUrl.slice(5).startsWith("/") || dbUrl.slice(5).match(/^[a-zA-Z]:/)
      ? dbUrl.replace(/\\/g, "/")  // Already absolute, just normalize slashes
      : `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), dbUrl.slice(5)).replace(/\\/g, "/")}`
    : dbUrl.replace(/\\/g, "/")
  : `file:${path.resolve(/*turbopackIgnore: true*/ process.cwd(), "prisma", "dev.db").replace(/\\/g, "/")}`;

// Set the environment variable so Prisma's inline schema picks it up
if (!process.env.DATABASE_URL_OVERRIDE) {
  process.env.DATABASE_URL = prismaUrl;
}

export const prisma =
  globalForPrisma.prisma ?? new PrismaClient({ 
    datasourceUrl: prismaUrl,
    log: process.env.NODE_ENV === "development" ? ["error"] : [],
  });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;
