import { existsSync, readFileSync } from "node:fs";
import path from "node:path";

let isLoaded = false;

/** Best-effort loader for .env-style files so TSX scripts work without manual export. */
export function loadEnvFile(fileName = ".env.local") {
  if (isLoaded) return;

  const filePath = path.resolve(process.cwd(), fileName);
  if (!existsSync(filePath)) {
    isLoaded = true;
    return;
  }

  const contents = readFileSync(filePath, "utf8");
  const lines = contents.split(/\r?\n/);

  for (const line of lines) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) {
      continue;
    }

    const equalsIndex = trimmed.indexOf("=");
    if (equalsIndex === -1) {
      continue;
    }

    const key = trimmed.slice(0, equalsIndex).trim();
    if (!key || process.env[key] !== undefined) {
      continue;
    }

    const rawValue = trimmed.slice(equalsIndex + 1).trim();
    process.env[key] = stripWrappingQuotes(rawValue);
  }

  isLoaded = true;
}

function stripWrappingQuotes(value: string) {
  if (
    (value.startsWith('"') && value.endsWith('"')) ||
    (value.startsWith("'") && value.endsWith("'"))
  ) {
    return value.slice(1, -1);
  }
  return value;
}
