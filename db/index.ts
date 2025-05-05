import { Pool as PgPool } from 'pg'; // Standard PostgreSQL pool
import { drizzle as drizzleNodePostgres } from 'drizzle-orm/node-postgres'; // Drizzle adapter for pg
import { Pool as NeonPool, neonConfig } from '@neondatabase/serverless'; // Neon pool
import { drizzle as drizzleNeonServerless } from 'drizzle-orm/neon-serverless'; // Drizzle adapter for Neon
import ws from "ws";
import * as schema from "@shared/schema";

if (!process.env.DATABASE_URL) {
  throw new Error(
    "DATABASE_URL must be set. Did you forget to provision a database?",
  );
}

let db: ReturnType<typeof drizzleNodePostgres | typeof drizzleNeonServerless>;
// Export a pool compatible with connect-pg-simple (needs pg.Pool)
// In production (Neon), this specific pool might not be directly usable
// for application queries if using the serverless driver, but is needed for session store.
// Consider a different session store for production if this becomes an issue.
export let pool: PgPool | NeonPool;

if (process.env.NODE_ENV === 'development') {
  console.log("Using pg driver for development");
  pool = new PgPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNodePostgres(pool, { schema });
} else {
  console.log("Using neon serverless driver for production");
  // Configure Neon WebSocket
  neonConfig.webSocketConstructor = ws;
  pool = new NeonPool({ connectionString: process.env.DATABASE_URL });
  db = drizzleNeonServerless(pool, { schema });
  // Note: The exported 'pool' here is NeonPool, which might not be ideal
  // if other parts of the app expect a pg.Pool interface directly,
  // especially outside the drizzle context (like connect-pg-simple might).
  // For local dev, the PgPool is correctly used.
  // Re-evaluate session management for production if using Neon serverless.
}

export { db }; // Export the configured drizzle instance