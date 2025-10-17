import { promises as fs } from "node:fs";
import path from "node:path";

import type { StoreConfig } from "@/lib/types";

const storesDir = path.join(process.cwd(), "stores");

export async function getStoreConfig(slug: string): Promise<StoreConfig> {
  const filePath = path.join(storesDir, `${slug}.json`);
  const file = await fs.readFile(filePath, "utf-8");
  return JSON.parse(file) as StoreConfig;
}

export async function listStores(): Promise<string[]> {
  const files = await fs.readdir(storesDir);
  return files.filter((file) => file.endsWith(".json")).map((file) => file.replace(/\.json$/, ""));
}
