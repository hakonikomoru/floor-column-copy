import { ActionFormData, ModalFormData } from "@minecraft/server-ui";
import { system } from "@minecraft/server";
import { copyColumn, getMaxCopyHeightForPlayer } from "./copy.js";
import { getMessages, resolveLocale, sendFc } from "./i18n.js";

const PRESET_HEIGHTS = [1, 3, 5, 10];

const MENU_ICON_BASE = "textures/ui/menu";

/** Shared menu action definitions (labels resolved per player locale). */
const COPY_MENU_ACTIONS = [
  { labelJa: "1ブロック", labelEn: "1 block", type: "preset", height: 1, icon: `${MENU_ICON_BASE}/height_1` },
  { labelJa: "3ブロック", labelEn: "3 blocks", type: "preset", height: 3, icon: `${MENU_ICON_BASE}/height_3` },
  { labelJa: "5ブロック", labelEn: "5 blocks", type: "preset", height: 5, icon: `${MENU_ICON_BASE}/height_5` },
  { labelJa: "10ブロック", labelEn: "10 blocks", type: "preset", height: 10, icon: `${MENU_ICON_BASE}/height_10` },
  { labelJa: "数値入力", labelEn: "Custom height", type: "custom", icon: `${MENU_ICON_BASE}/custom_input` },
  { labelJa: "最大", labelEn: "Maximum", type: "max", icon: `${MENU_ICON_BASE}/max_height` },
];

/**
 * @param {import("@minecraft/server").Player} player
 * @param {(typeof COPY_MENU_ACTIONS)[number]} action
 */
function actionLabel(player, action) {
  return resolveLocale(player) === "ja" ? action.labelJa : action.labelEn;
}

/**
 * @param {import("@minecraft/server").Player} player
 */
export async function showCopyHeightMenu(player) {
  if (!player?.isValid) {
    return;
  }

  const messages = getMessages(player);
  const maxHeight = getMaxCopyHeightForPlayer(player);
  const form = new ActionFormData()
    .title(messages.menuTitle)
    .body(messages.menuBody(maxHeight));

  for (const action of COPY_MENU_ACTIONS) {
    form.button(actionLabel(player, action), action.icon);
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
      if (player.isValid) {
        copyColumn(player, action.height);
      }
    });
    return;
  }

  if (action.type === "max") {
    system.run(() => {
      if (player.isValid) {
        copyColumn(player, maxHeight);
      }
    });
    return;
  }

  await showCustomHeightForm(player);
}

/**
 * @param {import("@minecraft/server").Player} player
 */
async function showCustomHeightForm(player) {
  if (!player?.isValid) {
    return;
  }

  const messages = getMessages(player);
  const maxHeight = getMaxCopyHeightForPlayer(player);
  const form = new ModalFormData()
    .title(messages.customTitle)
    .textField(messages.customField(maxHeight), messages.customPlaceholder, "1");

  const response = await form.show(player);
  if (response.canceled) {
    return;
  }

  const rawValue = String(response.formValues?.[0] ?? "").trim();
  const height = Number.parseInt(rawValue, 10);

  if (!Number.isInteger(height) || height < 1 || height > maxHeight) {
    sendFc(player, messages.invalidHeight(maxHeight));
    return;
  }

  system.run(() => {
    if (player.isValid) {
      copyColumn(player, height);
    }
  });
}

/**
 * @param {import("@minecraft/server").Player} player
 */
export function openCopyMenu(player) {
  showCopyHeightMenu(player).catch((error) => {
    console.warn(`[FC] copy menu failed: ${error?.message ?? error}`);
    if (player?.isValid) {
      sendFc(player, getMessages(player).menuOpenFailed);
    }
  });
}

export { PRESET_HEIGHTS, COPY_MENU_ACTIONS };
