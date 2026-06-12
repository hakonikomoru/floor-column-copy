import { cpSync, existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

export const FC_BEHAVIOR_PACK_ID = "f1a2b3c4-d5e6-4f78-9a0b-1c2d3e4f5a6b";
export const FC_RESOURCE_PACK_ID = "f4a5b6c7-d8e9-4fa1-2b3c-4d5e6f7a8b9c";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const defaultBehaviorSrc = join(repoRoot, "behavior_packs", "floor_column_copy");
const defaultResourceSrc = join(repoRoot, "resource_packs", "floor_column_copy");

/**
 * @param {string} manifestPath
 * @returns {number[]}
 */
export function readPackVersionFromManifest(manifestPath) {
  const manifest = JSON.parse(readFileSync(manifestPath, "utf8"));
  const version = manifest?.header?.version;
  if (!Array.isArray(version) || version.length < 3) {
    throw new Error(`Invalid header.version in ${manifestPath}`);
  }
  return version;
}

/**
 * @param {string} [worldName]
 * @returns {{ worldDir: string, behaviorDest: string, resourceDest: string }[]}
 */
export function findFcWorlds(worldName = "") {
  const appData = process.env.APPDATA;
  if (!appData) {
    throw new Error("APPDATA is not set (Windows / Minecraft Bedrock Launcher expected)");
  }

  const usersRoot = join(appData, "Minecraft Bedrock", "Users");
  const worlds = [];

  if (!existsSync(usersRoot)) {
    return worlds;
  }

  for (const user of readdirSync(usersRoot)) {
    const worldsRoot = join(usersRoot, user, "games", "com.mojang", "minecraftWorlds");
    if (!existsSync(worldsRoot)) continue;

    for (const world of readdirSync(worldsRoot)) {
      if (worldName && world !== worldName) continue;
      const worldDir = join(worldsRoot, world);
      const wbp = join(worldDir, "world_behavior_packs.json");
      if (!existsSync(wbp)) continue;
      const raw = readFileSync(wbp, "utf8");
      if (!raw.includes(FC_BEHAVIOR_PACK_ID)) continue;
      worlds.push({
        worldDir,
        behaviorDest: join(worldDir, "behavior_packs", "floor_column_copy"),
        resourceDest: join(worldDir, "resource_packs", "floor_column_copy"),
      });
    }
  }

  return worlds;
}

/**
 * @param {string} jsonPath
 * @param {string} packId
 * @param {number[]} version
 */
function upsertWorldPackVersion(jsonPath, packId, version) {
  if (!existsSync(jsonPath)) {
    writeFileSync(
      jsonPath,
      `${JSON.stringify([{ pack_id: packId, version }], null, "\t")}\n`,
      "utf8",
    );
    return true;
  }

  let entries;
  try {
    entries = JSON.parse(readFileSync(jsonPath, "utf8"));
    if (!Array.isArray(entries)) entries = [];
  } catch {
    entries = [];
  }

  let updated = false;
  for (const entry of entries) {
    if (entry?.pack_id !== packId) continue;
    entry.version = version;
    updated = true;
  }

  if (!updated) {
    entries.push({ pack_id: packId, version });
    updated = true;
  }

  if (!updated) return false;

  writeFileSync(jsonPath, `${JSON.stringify(entries, null, "\t")}\n`, "utf8");
  return true;
}

/**
 * @param {string} worldDir
 * @param {number[]} version
 */
export function syncWorldBehaviorPackVersion(worldDir, version) {
  return upsertWorldPackVersion(
    join(worldDir, "world_behavior_packs.json"),
    FC_BEHAVIOR_PACK_ID,
    version,
  );
}

/**
 * @param {string} worldDir
 * @param {number[]} version
 */
export function syncWorldResourcePackVersion(worldDir, version) {
  return upsertWorldPackVersion(
    join(worldDir, "world_resource_packs.json"),
    FC_RESOURCE_PACK_ID,
    version,
  );
}

function copyPackDir(src, dest, log) {
  if (!existsSync(src)) {
    throw new Error(`Source pack not found: ${src}`);
  }
  log(`Sync -> ${dest}`);
  if (existsSync(dest)) rmSync(dest, { recursive: true, force: true });
  cpSync(src, dest, { recursive: true });
}

/**
 * @param {{ worldName?: string, quiet?: boolean, behaviorSrc?: string, resourceSrc?: string }} [options]
 * @returns {{ ok: boolean, targets: string[], version: number[] }}
 */
export function syncBedrockWorldPack(options = {}) {
  const {
    worldName = "",
    quiet = false,
    behaviorSrc = defaultBehaviorSrc,
    resourceSrc = defaultResourceSrc,
  } = options;
  const log = quiet ? () => {} : console.log;
  const warn = quiet ? () => {} : console.warn;

  const behaviorManifest = join(behaviorSrc, "manifest.json");
  const resourceManifest = join(resourceSrc, "manifest.json");
  const behaviorVersion = readPackVersionFromManifest(behaviorManifest);
  const resourceVersion = existsSync(resourceManifest)
    ? readPackVersionFromManifest(resourceManifest)
    : behaviorVersion;

  const worlds = findFcWorlds(worldName);

  if (worlds.length === 0) {
    warn("No world with Floor Column Copy pack_id found.");
    return { ok: false, targets: [], version: behaviorVersion };
  }

  for (const { worldDir, behaviorDest, resourceDest } of worlds) {
    copyPackDir(behaviorSrc, behaviorDest, log);

    if (existsSync(resourceSrc)) {
      copyPackDir(resourceSrc, resourceDest, log);
      if (syncWorldResourcePackVersion(worldDir, resourceVersion)) {
        log(`Updated world_resource_packs.json -> ${resourceVersion.join(".")} (${worldDir})`);
      }
    }

    if (syncWorldBehaviorPackVersion(worldDir, behaviorVersion)) {
      log(`Updated world_behavior_packs.json -> ${behaviorVersion.join(".")} (${worldDir})`);
    }
  }

  log(
    `Done (BP v${behaviorVersion.join(".")}, RP v${resourceVersion.join(".")}). Quit Minecraft fully, toggle packs OFF/ON.`,
  );
  return {
    ok: true,
    targets: worlds.flatMap((w) => [w.behaviorDest, w.resourceDest]),
    version: behaviorVersion,
  };
}
