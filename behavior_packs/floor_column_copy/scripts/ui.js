import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { copyColumn, getMaxCopyHeightForPlayer } from "./copy.js";

const PRESET_HEIGHTS = [1, 3, 5, 10];

const MENU_ICON_BASE = "textures/ui/menu";

const COPY_MENU_ACTIONS = [
  { label: "1ブロック", type: "preset", height: 1, icon: `${MENU_ICON_BASE}/height_1` },
  { label: "3ブロック", type: "preset", height: 3, icon: `${MENU_ICON_BASE}/height_3` },
  { label: "5ブロック", type: "preset", height: 5, icon: `${MENU_ICON_BASE}/height_5` },
  { label: "10ブロック", type: "preset", height: 10, icon: `${MENU_ICON_BASE}/height_10` },
  { label: "数値入力", type: "custom", icon: `${MENU_ICON_BASE}/custom_input` },
  { label: "最大", type: "max", icon: `${MENU_ICON_BASE}/max_height` },
];

/**
 * @param {import("@minecraft/server").Player} player
 */
export async function showCopyHeightMenu(player) {
  const maxHeight = getMaxCopyHeightForPlayer(player);
  const form = new ActionFormData()
    .title("Floor Column Copy")
    .body(
      `足元ブロックから下方向にコピーする高さを選んでください。\n最大: ${maxHeight} ブロック`,
    );

  for (const action of COPY_MENU_ACTIONS) {
    form.button(action.label, action.icon);
  }

  const response = await form.show(player);
  if (response.canceled) {
    return;
  }

  const action = COPY_MENU_ACTIONS[response.selection ?? -1];
  if (!action) {
    return;
  }

  if (action.type === "preset") {
    system.run(() => {
      copyColumn(player, action.height);
    });
    return;
  }

  if (action.type === "max") {
    system.run(() => {
      copyColumn(player, maxHeight);
    });
    return;
  }

  await showCustomHeightForm(player);
}

/**
 * @param {import("@minecraft/server").Player} player
 */
async function showCustomHeightForm(player) {
  const form = new ModalFormData()
    .title("コピー高さの入力")
    .textField("高さ（1〜384）", "例: 20", "1");

  const response = await form.show(player);
  if (response.canceled) {
    return;
  }

  const rawValue = String(response.formValues?.[0] ?? "").trim();
  const height = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(height) || height < 1 || height > CONFIG.maxCopyHeight) {
    player.sendMessage(`${CONFIG.messages.prefix} ${CONFIG.messages.invalidHeight}`);
    return;
  }

  system.run(() => {
    copyColumn(player, height);
  });
}

/**
 * @param {import("@minecraft/server").Player} player
 */
export function openCopyMenu(player) {
  showCopyHeightMenu(player).catch((error) => {
    console.warn(`[FC] copy menu failed: ${error?.message ?? error}`);
  });
}

export { PRESET_HEIGHTS, COPY_MENU_ACTIONS };
