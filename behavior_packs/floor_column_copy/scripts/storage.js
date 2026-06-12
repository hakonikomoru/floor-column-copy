/** @typedef {{ permutations: import("@minecraft/server").BlockPermutation[], dimensionId: string, blockCount: number }} PlayerClipboard */

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
 * @param {string} dimensionId
 */
export function setClipboard(playerId, permutations, dimensionId) {
  clipboards.set(playerId, {
    permutations,
    dimensionId,
    blockCount: permutations.length,
  });
}

/**
 * @param {string} playerId
 */
export function clearClipboard(playerId) {
  clipboards.delete(playerId);
}
