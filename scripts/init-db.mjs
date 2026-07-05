import "dotenv/config";
import { Client } from "pg";

const schema = process.env.DB_SCHEMA ?? "monmon_whethertie";
const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = new Client({ connectionString });

try {
  await client.connect();
  await client.query(`CREATE SCHEMA IF NOT EXISTS "${schema}"`);
  console.log(`Schema "${schema}" is ready.`);
} finally {
  await client.end();
}
