import { execSync } from "node:child_process";
import { existsSync, readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { join, relative } from "node:path";

export function markerStart(id) {
  return `<!-- sync:auto:${id}:start -->`;
}

export function markerEnd(id) {
  return `<!-- sync:auto:${id}:end -->`;
}

export function replaceMarkedSection(content, id, body) {
  const start = markerStart(id);
  const end = markerEnd(id);
  const startIdx = content.indexOf(start);
  const endIdx = content.indexOf(end);
  if (startIdx === -1 || endIdx === -1 || endIdx < startIdx) {
    throw new Error(`Missing sync markers for "${id}" in docs/project-sync.md`);
  }
  const before = content.slice(0, startIdx + start.length);
  const after = content.slice(endIdx);
  const normalized = body.endsWith("\n") ? body : `${body}\n`;
  return `${before}\n${normalized}${after}`;
}

export function getGitCommit(cwd) {
  try {
    return execSync("git rev-parse --short HEAD", {
      cwd,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    }).trim();
  } catch {
    return "unknown";
  }
}

export function generateMetaLine(repo, commit, via = "npm run sync:project-docs") {
  const date = new Date().toISOString().slice(0, 10);
  return `最終更新の想定リポジトリ: \`${repo}\`（\`main\`・\`${commit}\`・${date}・\`${via}\` 自動反映）`;
}

function listSorted(dir) {
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((n) => !n.startsWith(".") && n !== "node_modules")
    .sort((a, b) => a.localeCompare(b, "en"));
}

function appendTree(dir, prefix, depth, maxDepth, lines) {
  if (depth > maxDepth) return;
  const names = listSorted(dir);
  names.forEach((name, i) => {
    const full = join(dir, name);
    const isLast = i === names.length - 1;
    const branch = isLast ? "└── " : "├── ";
    const childPrefix = isLast ? "    " : "│   ";
    const isDir = statSync(full).isDirectory();
    lines.push(`${prefix}${branch}${name}${isDir ? "/" : ""}`);
    if (isDir) appendTree(full, prefix + childPrefix, depth + 1, maxDepth, lines);
  });
}

export function generateDirectoryTree(root, rootLabel, topEntries, maxDepth = 3) {
  const lines = ["```", `${rootLabel}/`];
  for (const entry of topEntries) {
    const full = join(root, entry);
    if (!existsSync(full)) continue;
    const isDir = statSync(full).isDirectory();
    lines.push(`├── ${entry}${isDir ? "/" : ""}`);
    if (isDir) appendTree(full, "│   ", 1, maxDepth, lines);
  }
  lines.push("```");
  return lines.join("\n");
}

export function collectMcFunctions(functionsDir) {
  if (!existsSync(functionsDir)) return [];
  return listSorted(functionsDir)
    .filter((name) => name.endsWith(".mcfunction"))
    .map((name) => name.replace(/\.mcfunction$/, ""))
    .sort((a, b) => a.localeCompare(b, "en"));
}

function parseConfigString(block, key) {
  const re = new RegExp(`${key}:\\s*"([^"]*)"`);
  const match = block.match(re);
  return match ? match[1] : undefined;
}

function parseConfigNumber(block, key) {
  const re = new RegExp(`${key}:\\s*(-?\\d+(?:\\.\\d+)?)`);
  const match = block.match(re);
  return match ? Number(match[1]) : undefined;
}

function parseConfigItemIds(block) {
  const items = {};
  const itemsMatch = block.match(/items:\s*\{([\s\S]*?)\n\s*\},/);
  if (!itemsMatch) return items;
  const inner = itemsMatch[1];
  const entryRe = /(\w+):\s*"([^"]+)"/g;
  let m;
  while ((m = entryRe.exec(inner)) !== null) {
    items[m[1]] = m[2];
  }
  return items;
}

function parseHelpLines(block) {
  const helpMatch = block.match(/help:\s*\[([\s\S]*?)\]/);
  if (!helpMatch) return [];
  const lines = [];
  const lineRe = /"([^"]+)"/g;
  let m;
  while ((m = lineRe.exec(helpMatch[1])) !== null) {
    lines.push(m[1]);
  }
  return lines;
}

export function parseFcConfig(configSource) {
  const configMatch = configSource.match(/export const CONFIG = \{([\s\S]*?)\n\};/);
  if (!configMatch) {
    throw new Error("export const CONFIG = { ... } が config.js に見つかりません");
  }
  const block = configMatch[1];
  return {
    packVersion: parseConfigString(block, "packVersion"),
    namespace: parseConfigString(block, "namespace"),
    maxCopyHeight: parseConfigNumber(block, "maxCopyHeight"),
    defaultMinY: parseConfigNumber(block, "defaultMinY"),
    items: parseConfigItemIds(block),
    prefix: parseConfigString(block, "prefix") ?? "[FC]",
    helpLines: parseHelpLines(block),
  };
}

export function parseFcMenuActions(uiSource) {
  const actions = [];
  const labelRe = /label:\s*"([^"]+)"/g;
  const typeRe = /type:\s*"([^"]+)"/g;
  const heightRe = /height:\s*(\d+)/g;
  const labels = [...uiSource.matchAll(labelRe)].map((m) => m[1]);
  const types = [...uiSource.matchAll(typeRe)].map((m) => m[1]);
  const heights = [...uiSource.matchAll(heightRe)].map((m) => Number(m[1]));
  let heightIdx = 0;
  for (let i = 0; i < labels.length; i += 1) {
    const type = types[i] ?? "unknown";
    const entry = { label: labels[i], type };
    if (type === "preset") {
      entry.height = heights[heightIdx];
      heightIdx += 1;
    }
    actions.push(entry);
  }
  return actions;
}

export function generateFcGameRulesMarkdown(spec, menuActions, mcFunctions = []) {
  const copyWand = spec.items.copyWand ?? "floor_column_copy:copy_wand";
  const pasteWand = spec.items.pasteWand ?? "floor_column_copy:paste_wand";
  const menuRows = menuActions
    .map((action) => {
      if (action.type === "preset") {
        return `| ${action.label} | プリセット | ${action.height} ブロック |`;
      }
      if (action.type === "max") {
        return `| ${action.label} | 最大 | ワールド下限まで（上限 ${spec.maxCopyHeight}） |`;
      }
      if (action.type === "custom") {
        return `| ${action.label} | 数値入力 | 1〜${spec.maxCopyHeight}（その場の上限でクランプ） |`;
      }
      return `| ${action.label} | ${action.type} | — |`;
    })
    .join("\n");

  const helpLines = spec.helpLines.map((line) => `- ${line}`).join("\n");

  const lines = [
    "> behavior_packs/floor_column_copy/scripts/config.js と ui.js から自動生成。仕様変更後は npm run sync:project-docs を実行。",
    "",
    "### アイテム",
    "",
    "| アイテム | ID | 操作 |",
    "| --- | --- | --- |",
    `| コピーの杖 | \`${copyWand}\` | 右クリックで高さ選択メニュー |`,
    `| 貼り付けの杖 | \`${pasteWand}\` | 右クリックで即貼り付け |`,
    "",
    "### コピー仕様",
    "",
    `- 起点: プレイヤー足元ブロック（\`floor(location.y) - 1\`）`,
    `- 方向: **下方向（Y 軸のみ）**。横（X/Z）には広がらない`,
    `- 最大高さ: **${spec.maxCopyHeight} ブロック**（ワールド下限 \`${spec.defaultMinY}\` も考慮してクランプ）`,
    "- 保持: `BlockPermutation`（向き・ブロック状態）",
    "- 非対応: BlockEntity データ（チェスト中身・看板文字など）",
    "- クリップボード: プレイヤー単位・同一ワールドセッション内",
    "",
    "### コピー高さメニュー",
    "",
    "| ボタン | 種別 | 内容 |",
    "| --- | --- | --- |",
    menuRows,
    "",
    "### 操作・コマンド",
    "",
    "| 種別 | 入力 | Beta APIs |",
    "| --- | --- | --- |",
    "| 杖 | コピー/貼り付けの杖を使用（空中・ブロック上） | 不要 |",
    "| スラッシュ | `/fc:give` `/fc:menu` `/fc:paste` `/fc:help` | 不要（1.21.80+） |",
    ...mcFunctions.map((name) => `| 関数 | \`/function fc/${name}\` | 不要（チート ON） |`),
    "| scriptevent | `/scriptevent fc:give run` 等 | 不要（チート ON） |",
    "| チャット | `!fc give` `!fc menu` `!fc paste` | **必要** |",
    "",
    "### 初回配布",
    "",
    "- 初回スポーン時にコピーの杖・貼り付けの杖を自動配布（`fc:starter_given` で再配布を抑制）",
    "- クリエイティブ装備タブ **Floor Column Copy** からも取得可",
    "",
    "### ヘルプ文言（CONFIG.messages.help）",
    "",
    helpLines || "- （未設定）",
    "",
    `### パックバージョン`,
    "",
    `- script 表示: \`${spec.packVersion ?? "?"}\``,
  ];
  return lines.join("\n");
}

export function runSync(config, options = {}) {
  const { check = false } = options;
  const root = config.root ?? join(import.meta.dirname, "..");
  const docPath = join(root, config.docPath ?? "docs/project-sync.md");
  let content = readFileSync(docPath, "utf8");
  const commit = getGitCommit(root);
  const markers = config.markers ?? ["meta", "directory-tree"];

  if (markers.includes("meta")) {
    content = replaceMarkedSection(content, "meta", generateMetaLine(config.repo, commit));
  }
  if (markers.includes("directory-tree")) {
    content = replaceMarkedSection(
      content,
      "directory-tree",
      generateDirectoryTree(
        root,
        config.rootLabel,
        config.treeEntries ?? ["behavior_packs", "docs", "scripts"],
        config.treeMaxDepth ?? 3,
      ),
    );
  }
  if (markers.includes("game-rules") && config.gameRulesConfigJs) {
    const configPath = join(root, config.gameRulesConfigJs);
    const configSource = readFileSync(configPath, "utf8");
    const spec = parseFcConfig(configSource);
    let menuActions = [];
    if (config.gameRulesUiJs) {
      const uiPath = join(root, config.gameRulesUiJs);
      menuActions = parseFcMenuActions(readFileSync(uiPath, "utf8"));
    }
    const functionsDir = config.gameRulesFunctionsDir
      ? join(root, config.gameRulesFunctionsDir)
      : join(root, "behavior_packs/floor_column_copy/functions/fc");
    const mcFunctions = collectMcFunctions(functionsDir);
    content = replaceMarkedSection(
      content,
      "game-rules",
      generateFcGameRulesMarkdown(spec, menuActions, mcFunctions),
    );
  }

  const previous = readFileSync(docPath, "utf8");
  if (content === previous) {
    console.log("docs/project-sync.md は最新です");
    return true;
  }
  if (check) {
    console.error("docs/project-sync.md が古いです。npm run sync:project-docs を実行してください");
    return false;
  }
  writeFileSync(docPath, content, "utf8");
  console.log("docs/project-sync.md を更新しました");
  return true;
}
