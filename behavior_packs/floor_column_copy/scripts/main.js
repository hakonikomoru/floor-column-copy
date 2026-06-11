import { world, system, ItemStack } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { openCopyMenu } from "./ui.js";
import { pasteColumn } from "./paste.js";

console.warn("[FC] Floor Column Copy loaded");

/**
 * @param {import("@minecraft/server").Player} player
 */
export function giveWands(player) {
  const inventory = player.getComponent("inventory")?.container;
  if (!inventory) {
    player.sendMessage(`${CONFIG.messages.prefix} インベントリを取得できません`);
    return;
  }

  const items = [
    new ItemStack(CONFIG.items.copyWand, 1),
    new ItemStack(CONFIG.items.pasteWand, 1),
  ];

  for (const item of items) {
    const leftover = inventory.addItem(item);
    if (leftover) {
      player.dimension.spawnItem(leftover, player.location);
    }
  }

  player.sendMessage(`${CONFIG.messages.prefix} ${CONFIG.messages.giveDone}`);
}

function registerItemUseHandlers() {
  const itemUse = world.afterEvents?.itemUse;
  if (!itemUse) {
    console.warn("[FC] itemUse event is not available in this Script API version.");
    return;
  }

  itemUse.subscribe((event) => {
    const player = event.source;
    const item = event.itemStack;
    if (!player || !item) {
      return;
    }

    const typeId = item.typeId;

    if (typeId === CONFIG.items.copyWand) {
      system.run(() => {
        openCopyMenu(player);
      });
      return;
    }

    if (typeId === CONFIG.items.pasteWand) {
      system.run(() => {
        pasteColumn(player);
      });
    }
  });

  console.warn("[FC] item use handlers registered.");
}

function registerChatCommands() {
  const chatSend = world.beforeEvents?.chatSend;
  if (!chatSend) {
    console.warn("[FC] chatSend event is not available; !fc commands disabled.");
    return;
  }

  chatSend.subscribe((event) => {
    const message = event.message.trim();
    if (!message.toLowerCase().startsWith("!fc")) {
      return;
    }

    event.cancel = true;
    const player = event.sender;
    const args = message.slice(3).trim().split(/\s+/).filter(Boolean);
    const subcommand = (args[0] ?? "help").toLowerCase();

    system.run(() => {
      if (subcommand === "give") {
        giveWands(player);
        return;
      }

      if (subcommand === "menu" || subcommand === "copy") {
        openCopyMenu(player);
        return;
      }

      if (subcommand === "paste") {
        pasteColumn(player);
        return;
      }

      player.sendMessage(`${CONFIG.messages.prefix} ${CONFIG.messages.help}`);
    });
  });

  console.warn("[FC] chat commands registered (!fc give / menu / paste).");
}

registerItemUseHandlers();
registerChatCommands();
