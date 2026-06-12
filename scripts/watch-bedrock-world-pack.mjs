#!/usr/bin/env node
/**
 * behavior / resource pack の変更を検知してワールド内パックへ自動同期する。
 *
 * Usage:
 *   node scripts/watch-bedrock-world-pack.mjs
 *   node scripts/watch-bedrock-world-pack.mjs <worldId>
 */
import { existsSync, watch } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import { syncBedrockWorldPack } from "./sync-bedrock-world-pack-lib.mjs";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const watchRoots = [
  join(repoRoot, "behavior_packs", "floor_column_copy"),
  join(repoRoot, "resource_packs", "floor_column_copy"),
];
const worldName = process.argv[2] ?? "";
const debounceMs = 350;

let debounceTimer = undefined;
let syncing = false;

function timestamp() {
  return new Date().toLocaleTimeString("ja-JP", { hour12: false });
}

function runSync(reason) {
  if (syncing) return;
  syncing = true;
  try {
    console.log(`[${timestamp()}] sync (${reason})`);
    const result = syncBedrockWorldPack({ worldName });
    if (!result.ok) {
      console.warn(
        `[${timestamp()}] sync skipped: no world with Floor Column Copy pack. Run install + apply packs in world settings.`,
      );
    }
  } catch (error) {
    console.error(`[${timestamp()}] sync failed: ${error}`);
  } finally {
    syncing = false;
  }
}

function scheduleSync(reason) {
  if (debounceTimer !== undefined) {
    clearTimeout(debounceTimer);
  }
  debounceTimer = setTimeout(() => {
    debounceTimer = undefined;
    runSync(reason);
  }, debounceMs);
}

for (const watchRoot of watchRoots) {
  if (!existsSync(watchRoot)) {
    console.error(`Watch path not found: ${watchRoot}`);
    process.exit(1);
  }
}

console.log("Watching:");
for (const watchRoot of watchRoots) {
  console.log(`  ${watchRoot}`);
}
if (worldName) {
  console.log(`World filter: ${worldName}`);
}
console.log("Press Ctrl+C to stop.\n");

runSync("initial");

for (const watchRoot of watchRoots) {
  try {
    watch(watchRoot, { recursive: true }, (_eventType, filename) => {
      if (filename && /(^|[\\/])\.[^\\/]+/.test(filename)) return;
      scheduleSync(filename ?? "change");
    });
  } catch (error) {
    console.warn(`Recursive watch unavailable for ${watchRoot} (${error}). Falling back.`);
    watch(watchRoot, () => scheduleSync("change"));
  }
}

process.on("SIGINT", () => {
  console.log("\nStopped.");
  process.exit(0);
});
