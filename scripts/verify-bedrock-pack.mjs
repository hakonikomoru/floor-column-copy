#!/usr/bin/env node
/**
 * ローカルの Bedrock pack 配置をざっと確認する（Minecraft Launcher 既定パス想定）。
 */
import { existsSync, readdirSync } from "node:fs";
import { join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const repoRoot = resolve(fileURLToPath(new URL("..", import.meta.url)));
const repoBehavior = join(repoRoot, "behavior_packs", "floor_column_copy");
const repoResource = join(repoRoot, "resource_packs", "floor_column_copy");

/**
 * @param {string} label
 * @param {string} packRoot
 * @param {"behavior" | "resource"} kind
 */
function checkPackRoot(label, packRoot, kind) {
  console.log(`\n=== ${label} ===`);
  console.log(packRoot);

  if (!existsSync(packRoot)) {
    console.log("  MISSING pack folder");
    return false;
  }

  let ok = true;
  const required =
    kind === "behavior"
      ? [
          "manifest.json",
          "pack_icon.png",
          "scripts/main.js",
          "scripts/ui.js",
          "scripts/i18n.js",
          "functions/fc/give.mcfunction",
          "functions/fc/menu.mcfunction",
        ]
      : ["manifest.json", "pack_icon.png", "textures/item_texture.json"];

  for (const rel of required) {
    const path = join(packRoot, rel);
    const mark = existsSync(path) ? "OK" : "MISSING";
    console.log(`  [${mark}] ${rel}`);
    if (mark === "MISSING") ok = false;
  }

  return ok;
}

let allOk = true;
allOk = checkPackRoot("Repository behavior pack", repoBehavior, "behavior") && allOk;
allOk = checkPackRoot("Repository resource pack", repoResource, "resource") && allOk;

const appData = process.env.APPDATA;
if (appData) {
  const bedrockUsers = join(appData, "Minecraft Bedrock", "Users");
  const deployRoots = {
    behavior: [
      join(bedrockUsers, "Shared", "games", "com.mojang", "behavior_packs", "floor_column_copy"),
    ],
    resource: [
      join(bedrockUsers, "Shared", "games", "com.mojang", "resource_packs", "floor_column_copy"),
    ],
  };

  if (existsSync(bedrockUsers)) {
    for (const name of readdirSync(bedrockUsers)) {
      if (name === "Shared") continue;
      const userRoot = join(bedrockUsers, name, "games", "com.mojang");
      if (!existsSync(join(bedrockUsers, name, "games"))) continue;
      deployRoots.behavior.push(join(userRoot, "behavior_packs", "floor_column_copy"));
      deployRoots.resource.push(join(userRoot, "resource_packs", "floor_column_copy"));
    }
  }

  for (const deployed of deployRoots.behavior) {
    if (existsSync(deployed)) {
      allOk = checkPackRoot(`Deployed behavior: ${deployed}`, deployed, "behavior") && allOk;
    }
  }
  for (const deployed of deployRoots.resource) {
    if (existsSync(deployed)) {
      allOk = checkPackRoot(`Deployed resource: ${deployed}`, deployed, "resource") && allOk;
    }
  }

  const hasBehavior = deployRoots.behavior.some((p) => existsSync(p));
  const hasResource = deployRoots.resource.some((p) => existsSync(p));
  if (!hasBehavior || !hasResource) {
    console.log(
      "\n[WARN] Deployed pack junction not found. Run: npm run install:bedrock-pack",
    );
    allOk = false;
  }
} else {
  console.log("\n(APPDATA not set — skipped deployed pack check)");
}

console.log(allOk ? "\nverify: OK" : "\nverify: FAILED — fix paths or junction");
process.exit(allOk ? 0 : 1);
