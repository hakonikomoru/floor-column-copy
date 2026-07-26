/**
 * Player-facing strings (JA / EN).
 * Uses player.locale when available; non-Japanese locales fall back to English.
 */

const MESSAGES = {
  en: {
    prefix: "[FC]",
    ready: "Floor Column Copy ready",
    noClipboard: "No copied blocks",
    noBlocksToCopy: "No blocks to copy",
    dimensionMismatch: "Clipboard is from another dimension (paste continues)",
    copyDone: (count) => `Copied ${count} block(s)`,
    copyPartial: (count, requested) =>
      `Copied ${count} block(s) (requested ${requested}; stopped at world bottom)`,
    pasteDone: (count) => `Pasted ${count} block(s)`,
    pastePartial: (count, total) =>
      `Pasted ${count}/${total} block(s) (some placements failed)`,
    invalidHeight: (max) => `Enter an integer height from 1 to ${max}`,
    giveDone: "Gave Copy Wand and Paste Wand",
    inventoryUnavailable: "Could not access inventory",
    menuOpenFailed: "Could not open the menu",
    readyHintUse: "Use Copy Wand → choose height / Paste Wand → paste instantly",
    readyHintGive: "Get wands with /function fc/give or /fc:give",
    readyHintBeta: "(!fc chat commands need Beta APIs)",
    help: [
      "How to use: choose a height with the Copy Wand, then paste with the Paste Wand",
      "Get wands: Creative Items tab / /function fc/give / /fc:give",
      "Menu: use Copy Wand / /function fc/menu / /fc:menu",
    ],
    menuTitle: "Floor Column Copy",
    menuBody: (maxHeight) =>
      `Choose how far downward to copy from the block under your feet.\nMax: ${maxHeight} blocks`,
    customTitle: "Enter copy height",
    customField: (maxHeight) => `Height (1–${maxHeight})`,
    customPlaceholder: "e.g. 20",
    buttonPreset: (n) => `${n} block${n === 1 ? "" : "s"}`,
    buttonCustom: "Custom height",
    buttonMax: "Maximum",
  },
  ja: {
    prefix: "[FC]",
    ready: "Floor Column Copy 準備OK",
    noClipboard: "コピーされたブロックがありません",
    noBlocksToCopy: "コピーできるブロックがありません",
    dimensionMismatch: "別ディメンションからのコピーです（貼り付けは続行します）",
    copyDone: (count) => `コピー完了：${count}ブロック`,
    copyPartial: (count, requested) =>
      `コピー完了：${count}ブロック（要求 ${requested}、ワールド下限で打ち切り）`,
    pasteDone: (count) => `貼り付け完了：${count}ブロック`,
    pastePartial: (count, total) =>
      `貼り付け完了：${count}/${total}ブロック（途中で設置できませんでした）`,
    invalidHeight: (max) => `高さは1〜${max}の整数で入力してください`,
    giveDone: "コピーの杖と貼り付けの杖を付与しました",
    inventoryUnavailable: "インベントリを取得できません",
    menuOpenFailed: "メニューを開けませんでした",
    readyHintUse: "コピーの杖を使用 → 高さ選択 / 貼り付けの杖を使用 → 即貼り付け",
    readyHintGive: "/function fc/give または /fc:give で杖を入手",
    readyHintBeta: "(!fc は Beta APIs が必要です)",
    help: [
      "使い方: コピーの杖で高さを選び、貼り付けの杖で即貼り付け",
      "杖の入手: クリエイティブアイテムタブ / /function fc/give / /fc:give",
      "メニュー: コピーの杖を使用 / /function fc/menu / /fc:menu",
    ],
    menuTitle: "Floor Column Copy",
    menuBody: (maxHeight) =>
      `足元ブロックから下方向にコピーする高さを選んでください。\n最大: ${maxHeight} ブロック`,
    customTitle: "コピー高さの入力",
    customField: (maxHeight) => `高さ（1〜${maxHeight}）`,
    customPlaceholder: "例: 20",
    buttonPreset: (n) => `${n}ブロック`,
    buttonCustom: "数値入力",
    buttonMax: "最大",
  },
};

/**
 * @param {import("@minecraft/server").Player | undefined} player
 * @returns {"en" | "ja"}
 */
export function resolveLocale(player) {
  try {
    const locale = player?.locale;
    if (typeof locale === "string" && locale.toLowerCase().startsWith("ja")) {
      return "ja";
    }
  } catch {
    // Fall through to English.
  }
  return "en";
}

/**
 * @param {import("@minecraft/server").Player | undefined} player
 */
export function getMessages(player) {
  return MESSAGES[resolveLocale(player)];
}

/**
 * @param {import("@minecraft/server").Player | undefined} player
 * @param {string} text
 */
export function sendFc(player, text) {
  if (!player?.isValid) {
    return;
  }
  const messages = getMessages(player);
  player.sendMessage(`${messages.prefix} ${text}`);
}

export { MESSAGES };
