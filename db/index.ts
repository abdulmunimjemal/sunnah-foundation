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

// Common SSL configuration
const sslConfig = process.env.NODE_ENV === 'production' 
  ? { sslmode: 'require' } // Enforce SSL in production, assuming Aiven requires it.
  : { rejectUnauthorized: false }; // Allow self-signed certs in dev/test

if (process.env.NODE_ENV === 'development') {
  console.log("Using pg driver for development");
  pool = new PgPool({ 
    connectionString: process.env.DATABASE_URL,
    ssl: sslConfig 
  });
  db = drizzleNodePostgres(pool, { schema });
} else {
  console.log("Using neon serverless driver for production");
  neonConfig.webSocketConstructor = ws;
  // For Neon, SSL is typically handled by the connection string or their driver's defaults.
  // If specific SSL control is needed here, consult Neon's documentation.
  // The DATABASE_URL for Neon usually includes sslmode=require.
  pool = new NeonPool({ 
    connectionString: process.env.DATABASE_URL 
    // NeonPool might not directly expose 'ssl' like pg.Pool. 
    // It often relies on the connection string or environment variables.
  });
  db = drizzleNeonServerless(pool, { schema });
}

export { db }; // Export the configured drizzle instance