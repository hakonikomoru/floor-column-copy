#!/usr/bin/env node
/**
 * BOOTH / 配布用 .mcaddon を dist/ に生成する。
 * 中身: ビヘイビアパック + リソースパック（各フォルダ直下に manifest.json）
 */
import { execFileSync } from "node:child_process";
import {
  cpSync,
  existsSync,
  mkdirSync,
  readFileSync,
  rmSync,
  writeFileSync,
} from "node:fs";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const behaviorSrc = join(root, "behavior_packs", "floor_column_copy");
const resourceSrc = join(root, "resource_packs", "floor_column_copy");
const distDir = join(root, "dist");
const stagingDir = join(distDir, "_mcaddon_staging");

function readPackVersion() {
  const configPath = join(behaviorSrc, "scripts", "config.js");
  const source = readFileSync(configPath, "utf8");
  const match = source.match(/packVersion:\s*"([^"]+)"/);
  return match?.[1] ?? "0.0.0";
}

function assertPack(label, packRoot) {
  const manifest = join(packRoot, "manifest.json");
  if (!existsSync(manifest)) {
    throw new Error(`${label} に manifest.json がありません: ${packRoot}`);
  }
}

function compressZip(sourceDir, zipPath) {
  if (existsSync(zipPath)) {
    rmSync(zipPath, { force: true });
  }

  // Compress-Archive はパス区切りに注意。staging 内の全フォルダを zip 化。
  const ps = `
$ErrorActionPreference = 'Stop'
$src = ${JSON.stringify(sourceDir)}
$dest = ${JSON.stringify(zipPath)}
if (Test-Path -LiteralPath $dest) { Remove-Item -LiteralPath $dest -Force }
Compress-Archive -Path (Join-Path $src '*') -DestinationPath $dest -CompressionLevel Optimal
`;
  execFileSync(
    "powershell.exe",
    ["-NoProfile", "-NonInteractive", "-Command", ps],
    { stdio: "inherit" },
  );
}

function main() {
  assertPack("behavior pack", behaviorSrc);
  assertPack("resource pack", resourceSrc);

  const version = readPackVersion();
  const baseName = `FloorColumnCopy_v${version}`;
  const zipPath = join(distDir, `${baseName}.zip`);
  const mcaddonPath = join(distDir, `${baseName}.mcaddon`);

  mkdirSync(distDir, { recursive: true });
  rmSync(stagingDir, { recursive: true, force: true });
  mkdirSync(stagingDir, { recursive: true });

  const bpDest = join(stagingDir, "floor_column_copy_bp");
  const rpDest = join(stagingDir, "floor_column_copy_rp");
  cpSync(behaviorSrc, bpDest, { recursive: true });
  cpSync(resourceSrc, rpDest, { recursive: true });

  compressZip(stagingDir, zipPath);
  if (existsSync(mcaddonPath)) {
    rmSync(mcaddonPath, { force: true });
  }
  // .mcaddon は中身が zip の別名
  cpSync(zipPath, mcaddonPath);
  rmSync(stagingDir, { recursive: true, force: true });

  const readme = [
    `# Floor Column Copy v${version}`,
    "",
    "## 購入者向け（導入）",
    "",
    `1. FloorColumnCopy_v${version}.mcaddon をダブルクリック（Minecraft が開きます）`,
    "2. ワールド設定で ビヘイビアパック と リソースパック の両方に Floor Column Copy を追加",
    "3. ワールドに入る（初回スポーンで杖配布）。無ければ /fc:give",
    "",
    "## 注意",
    "",
    "- 統合版（Bedrock）1.21 以降向けです",
    "- 公式 Marketplace 商品ではありません",
    "- 再配布・転売禁止",
    "",
    "制作: komolab - こもらぼ -",
    "",
  ].join("\n");
  writeFileSync(join(distDir, "README_BUYER.txt"), readme, "utf8");

  console.log("Created:");
  console.log(`  ${mcaddonPath}`);
  console.log(`  ${zipPath}`);
  console.log(`  ${join(distDir, "README_BUYER.txt")}`);
  console.log("");
  console.log("BOOTH の「作品ファイル」には .mcaddon をアップロードしてください。");
}

main();
