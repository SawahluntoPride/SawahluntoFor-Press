import { PrismaClient } from "./generated/prisma";
import path from "path";

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient;
};

// Fix: Ensure the database path is correctly resolved for SQLite on Windows
// Next.js loads .env.local and .env, but DATABASE_URL may use relative path "file:./dev.db"
// Prisma CLI resolves relative "file:" paths against the folder containing schema.prisma
// (i.e. prisma/), so we need to resolve against that same folder here, not process.cwd().
const dbUrl = process.env.DATABASE_URL;
const PRISMA_SCHEMA_DIR = path.join(process.cwd(), "prisma");

const prismaUrl = dbUrl
  ? dbUrl.startsWith("file:")
    ? dbUrl.slice(5).startsWith("/") || dbUrl.slice(5).match(/^[a-zA-Z]:/)
      ? dbUrl.replace(/\\/g, "/") // Already absolute, just normalize slashes
      : `file:${path.resolve(/*turbopackIgnore: true*/ PRISMA_SCHEMA_DIR, dbUrl.slice(5)).replace(/\\/g, "/")}`
    : dbUrl.replace(/\\/g, "/") // Non-SQLite connection string (mysql://, postgresql://, etc.) — leave untouched
  : `file:${path.resolve(/*turbopackIgnore: true*/ PRISMA_SCHEMA_DIR, "dev.db").replace(/\\/g, "/")}`;

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
