import "server-only";

import fs from "node:fs";
import path from "node:path";
import type {
  docs as DocsEntry,
  components as ComponentsEntry,
  demos as DemosEntry,
} from "#site/content";

type VeliteItem = Record<string, unknown>;

const veliteDir = path.join(process.cwd(), ".velite");

function readCollection<T extends VeliteItem>(filename: string): T[] {
  const filepath = path.join(veliteDir, filename);

  try {
    const raw = fs.readFileSync(filepath, "utf8");
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as T[]) : [];
  } catch {
    return [];
  }
}

export const docs = readCollection<DocsEntry>("docs.json");
export const components = readCollection<ComponentsEntry>("components.json");
export const demos = readCollection<DemosEntry>("demos.json");
