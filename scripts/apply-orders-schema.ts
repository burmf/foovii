import { readFileSync } from "node:fs";
import { resolve } from "node:path";

import postgres from "postgres";
import { loadEnvFile } from "./utils/load-env";

loadEnvFile();

async function main() {
  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error(
      "DATABASE_URL is not set. See config/.env.example for details.",
    );
    process.exit(1);
  }

  const scriptArg = process.argv[2];
  const schemaPath = resolve(
    process.cwd(),
    scriptArg ?? "supabase/sql/orders-schema.sql",
  );

  const sqlText = readFileSync(schemaPath, "utf8");
  if (!sqlText.trim()) {
    console.error(`Schema file at ${schemaPath} is empty.`);
    process.exit(1);
  }

  const sql = postgres(databaseUrl, {
    ssl: "require",
  });

  try {
    console.info(`Applying orders schema from ${schemaPath}`);
    await sql.unsafe(sqlText);
    console.info("Orders schema applied successfully.");
  } finally {
    await sql.end({ timeout: 5 });
  }
}

main().catch((error) => {
  console.error("Failed to apply orders schema:", error);
  process.exit(1);
});
