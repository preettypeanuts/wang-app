import "dotenv/config";
import { Client } from "pg";

const connectionString = process.env.DATABASE_URL;

if (!connectionString) {
  throw new Error("DATABASE_URL is not set");
}

const client = new Client({ connectionString });

try {
  await client.connect();

  const { rows } = await client.query(`
    SELECT pid, state, application_name, backend_start
    FROM pg_stat_activity
    WHERE usename = current_user
      AND datname = current_database()
      AND pid <> pg_backend_pid()
    ORDER BY backend_start
  `);

  if (rows.length === 0) {
    console.log("No other connections for this role.");
    process.exit(0);
  }

  const { rowCount } = await client.query(`
    SELECT pg_terminate_backend(pid)
    FROM pg_stat_activity
    WHERE usename = current_user
      AND datname = current_database()
      AND pid <> pg_backend_pid()
  `);

  console.log(
    `Terminated ${rowCount ?? 0} connection(s) for role (was ${rows.length} idle/active).`,
  );
} finally {
  await client.end();
}
