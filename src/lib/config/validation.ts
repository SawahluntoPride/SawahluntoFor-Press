/**
 * Runtime configuration validation.
 * Throws errors if required environment variables are missing or invalid.
 */

export function validateEnvironment(): void {
  const errors: string[] = [];

  // Validate SESSION_SECRET
  const sessionSecret = process.env.SESSION_SECRET;
  if (!sessionSecret) {
    errors.push("SESSION_SECRET is required.");
  } else if (sessionSecret.length < 32) {
    errors.push("SESSION_SECRET must be at least 32 characters long.");
  }

  // Validate DATABASE_URL
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    errors.push("DATABASE_URL is required.");
  }

  if (errors.length > 0) {
    throw new Error(
      `Configuration validation failed:\n${errors.map((e) => `  - ${e}`).join("\n")}`,
    );
  }
}

// Validate on module load (development) or explicitly in startup
if (process.env.NODE_ENV !== "test") {
  validateEnvironment();
}
