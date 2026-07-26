import { CONFIG } from "./config.js";
import { getMessages, sendFc } from "./i18n.js";
import { setClipboard } from "./storage.js";

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {{ x: number, y: number, z: number }}
 */
export function getFootBlockLocation(player) {
  const location = player.location;
  return {
    x: Math.floor(location.x),
    y: Math.floor(location.y) - 1,
    z: Math.floor(location.z),
  };
}

/**
 * @param {import("@minecraft/server").Dimension} dimension
 * @returns {number}
 */
export function getWorldMinY(dimension) {
  try {
    const min = dimension.heightRange?.min;
    if (typeof min === "number") {
      return min;
    }
  } catch {
    // Fall back below.
  }
  return CONFIG.defaultMinY;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {number}
 */
export function getMaxCopyHeightForPlayer(player) {
  const foot = getFootBlockLocation(player);
  const minY = getWorldMinY(player.dimension);
  const worldLimit = foot.y - minY + 1;
  return Math.min(CONFIG.maxCopyHeight, Math.max(worldLimit, 0));
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} requestedHeight
 * @returns {number}
 */
export function clampCopyHeight(player, requestedHeight) {
  const maxHeight = getMaxCopyHeightForPlayer(player);
  return Math.min(Math.max(requestedHeight, 0), maxHeight);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {number} height
 * @returns {number}
 */
export function copyColumn(player, height) {
  const safeHeight = clampCopyHeight(player, height);
  if (safeHeight <= 0) {
    sendFc(player, getMessages(player).noBlocksToCopy);
    return 0;
  }

  const dimension = player.dimension;
  const { x, y: startY, z } = getFootBlockLocation(player);
  const minY = getWorldMinY(dimension);
  /** @type {import("@minecraft/server").BlockPermutation[]} */
  const permutations = [];

  for (let offset = 0; offset < safeHeight; offset += 1) {
    const y = startY - offset;
    if (y < minY) {
      break;
    }

    try {
      const block = dimension.getBlock({ x, y, z });
      if (!block) {
        break;
      }
      permutations.push(block.permutation);
    } catch (error) {
      console.warn(`[FC] copy skipped at y=${y}: ${error?.message ?? error}`);
      break;
    }
  }

  if (permutations.length === 0) {
    sendFc(player, getMessages(player).noBlocksToCopy);
    return 0;
  }

  setClipboard(player.id, permutations, dimension.id);
  const messages = getMessages(player);
  const message =
    safeHeight > permutations.length
      ? messages.copyPartial(permutations.length, safeHeight)
      : messages.copyDone(permutations.length);
  sendFc(player, message);
  return permutations.length;
}
