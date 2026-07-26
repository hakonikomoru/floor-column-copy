import { getMessages, sendFc } from "./i18n.js";
import { getClipboard } from "./storage.js";
import { getFootBlockLocation, getWorldMinY } from "./copy.js";

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {number}
 */
export function pasteColumn(player) {
  const clipboard = getClipboard(player.id);
  if (!clipboard || clipboard.permutations.length === 0) {
    sendFc(player, getMessages(player).noClipboard);
    return 0;
  }

  const dimension = player.dimension;
  if (clipboard.dimensionId !== dimension.id) {
    sendFc(player, getMessages(player).dimensionMismatch);
  }

  const { x, y: startY, z } = getFootBlockLocation(player);
  const minY = getWorldMinY(dimension);
  let pasted = 0;

  for (let offset = 0; offset < clipboard.permutations.length; offset += 1) {
    const y = startY - offset;
    if (y < minY) {
      break;
    }

    try {
      const block = dimension.getBlock({ x, y, z });
      if (!block) {
        break;
      }
      block.setPermutation(clipboard.permutations[offset]);
      pasted += 1;
    } catch (error) {
      console.warn(`[FC] paste skipped at y=${y}: ${error?.message ?? error}`);
      break;
    }
  }

  const total = clipboard.permutations.length;
  const messages = getMessages(player);
  const message =
    pasted < total
      ? messages.pastePartial(pasted, total)
      : messages.pasteDone(pasted);
  sendFc(player, message);
  return pasted;
}
