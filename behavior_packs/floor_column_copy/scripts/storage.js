/** @typedef {{ permutations: import("@minecraft/server").BlockPermutation[] }} PlayerClipboard */

/** @type {Map<string, PlayerClipboard>} */
const clipboards = new Map();

/**
 * @param {string} playerId
 * @returns {PlayerClipboard | undefined}
 */
export function getClipboard(playerId) {
  return clipboards.get(playerId);
}

/**
 * @param {string} playerId
 * @param {import("@minecraft/server").BlockPermutation[]} permutations
 */
export function setClipboard(playerId, permutations) {
  clipboards.set(playerId, { permutations });
}

/**
 * @param {string} playerId
 */
export function clearClipboard(playerId) {
  clipboards.delete(playerId);
}
