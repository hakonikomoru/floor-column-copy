import { world, system, ItemStack } from "@minecraft/server";
import { CONFIG } from "./config.js";
import { getMessages, sendFc } from "./i18n.js";
import { openCopyMenu } from "./ui.js";
import { pasteColumn } from "./paste.js";

console.warn(`[FC] Floor Column Copy loaded (pack ${CONFIG.packVersion})`);

/** @type {Map<string, number>} */
const wandActionTick = new Map();

let gameEventsRegistered = false;
let startupRegistered = false;
let addonReadyDone = false;
/** @type {"before" | "after" | "none"} */
let chatHandlerMode = "none";

/**
 * @param {import("@minecraft/server").Player} player
 */
export function giveWands(player) {
  if (!player?.isValid) {
    return;
  }

  const inventory = player.getComponent("inventory")?.container;
  if (!inventory) {
    sendFc(player, getMessages(player).inventoryUnavailable);
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

  player.setDynamicProperty(CONFIG.dynamicProperties.starterGiven, true);
  sendFc(player, getMessages(player).giveDone);
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {{ force?: boolean }} [options]
 */
function tryGiveStarterWands(player, options = {}) {
  if (!player?.isValid) {
    return;
  }

  if (!options.force && player.getDynamicProperty(CONFIG.dynamicProperties.starterGiven)) {
    return;
  }

  giveWands(player);
}

/**
 * @param {import("@minecraft/server").Player} player
 */
function showHelp(player) {
  const messages = getMessages(player);
  for (const line of messages.help) {
    sendFc(player, line);
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {string} action
 */
function runFcAction(player, action) {
  if (!player?.isValid) {
    return;
  }

  switch (action) {
    case "give":
      giveWands(player);
      return;
    case "menu":
    case "copy":
      openCopyMenu(player);
      return;
    case "paste":
      pasteColumn(player);
      return;
    case "help":
    default:
      showHelp(player);
  }
}

/**
 * @param {import("@minecraft/server").Player} player
 * @returns {import("@minecraft/server").ItemStack | undefined}
 */
function getHeldItemStack(player) {
  const inventory = player.getComponent("inventory");
  const container = inventory?.container;
  if (!container) {
    return undefined;
  }

  let slot = 0;
  if (inventory && typeof inventory.selectedSlot === "number") {
    slot = inventory.selectedSlot;
  } else if (typeof player.selectedSlotIndex === "number") {
    slot = player.selectedSlotIndex;
  }

  return container.getItem(slot);
}

/**
 * @param {string | undefined} typeId
 */
function isFcWand(typeId) {
  return typeId === CONFIG.items.copyWand || typeId === CONFIG.items.pasteWand;
}

/**
 * @param {import("@minecraft/server").Player} player
 * @param {import("@minecraft/server").ItemStack | undefined} itemStack
 */
function handleWandUse(player, itemStack) {
  if (!player?.isValid || !itemStack) {
    return;
  }

  const tick = system.currentTick;
  if (wandActionTick.get(player.id) === tick) {
    return;
  }
  wandActionTick.set(player.id, tick);

  if (itemStack.typeId === CONFIG.items.copyWand) {
    openCopyMenu(player);
    return;
  }

  if (itemStack.typeId === CONFIG.items.pasteWand) {
    pasteColumn(player);
  }
}

function registerItemUseHandlers() {
  /**
   * @param {{ source?: import("@minecraft/server").Player, itemStack?: import("@minecraft/server").ItemStack }} event
   * @param {boolean} cancelVanilla
   */
  const onItemUse = (event, cancelVanilla) => {
    const player = event.source;
    const itemStack = event.itemStack;
    if (!player || !itemStack || !isFcWand(itemStack.typeId)) {
      return;
    }

    if (cancelVanilla) {
      event.cancel = true;
    }

    system.run(() => handleWandUse(player, itemStack));
  };

  const afterUse = world.afterEvents?.itemUse;
  if (afterUse) {
    afterUse.subscribe((event) => onItemUse(event, false));
    console.warn("[FC] item handler: afterEvents.itemUse");
    return;
  }

  const beforeUse = world.beforeEvents?.itemUse;
  if (beforeUse) {
    beforeUse.subscribe((event) => onItemUse(event, true));
    console.warn("[FC] item handler: beforeEvents.itemUse");
    return;
  }

  console.warn("[FC] itemUse events not available");
}

function registerWandBlockInteractHandlers() {
  /**
   * @param {{ player?: import("@minecraft/server").Player, itemStack?: import("@minecraft/server").ItemStack }} event
   * @param {boolean} cancelVanilla
   */
  const onBlockInteract = (event, cancelVanilla) => {
    const player = event.player;
    if (!player) {
      return;
    }

    const held = event.itemStack ?? getHeldItemStack(player);
    if (!held || !isFcWand(held.typeId)) {
      return;
    }

    if (cancelVanilla) {
      event.cancel = true;
    }

    system.run(() => handleWandUse(player, held));
  };

  const before = world.beforeEvents?.playerInteractWithBlock;
  if (before) {
    before.subscribe((event) => onBlockInteract(event, true));
    console.warn("[FC] wand handler: beforeEvents.playerInteractWithBlock");
  }

  const after = world.afterEvents?.playerInteractWithBlock;
  if (after) {
    after.subscribe((event) => onBlockInteract(event, false));
    console.warn("[FC] wand handler: afterEvents.playerInteractWithBlock");
  }
}

function registerChatHandlers() {
  const beforeChat = world.beforeEvents?.chatSend;
  if (beforeChat) {
    beforeChat.subscribe((event) => {
      const message = event.message.trim();
      if (!message.toLowerCase().startsWith("!fc")) {
        return;
      }

      event.cancel = true;
      const player = event.sender;
      const args = message.slice(3).trim().split(/\s+/).filter(Boolean);
      const subcommand = (args[0] ?? "help").toLowerCase();

      system.run(() => runFcAction(player, subcommand));
    });
    chatHandlerMode = "before";
    console.warn("[FC] chat handler: beforeEvents.chatSend");
    return;
  }

  const afterChat = world.afterEvents?.chatSend;
  if (afterChat) {
    afterChat.subscribe((event) => {
      const message = event.message.trim();
      if (!message.toLowerCase().startsWith("!fc")) {
        return;
      }

      const player = event.sender;
      const args = message.slice(3).trim().split(/\s+/).filter(Boolean);
      const subcommand = (args[0] ?? "help").toLowerCase();

      system.run(() => runFcAction(player, subcommand));
    });
    chatHandlerMode = "after";
    console.warn("[FC] chat handler: afterEvents.chatSend");
    return;
  }

  chatHandlerMode = "none";
  console.warn("[FC] chat handlers unavailable — use wand, /function fc/*, or /fc:*");
}

/**
 * @param {string} eventId
 * @param {import("@minecraft/server").Entity | undefined} sourceEntity
 */
function handleScriptEvent(eventId, sourceEntity) {
  const id = eventId.toLowerCase();
  const player =
    sourceEntity && typeof sourceEntity.sendMessage === "function" ? sourceEntity : undefined;

  if (!player) {
    return;
  }

  if (id.includes("give")) {
    runFcAction(player, "give");
    return;
  }
  if (id.includes("menu") || id.includes("copy")) {
    runFcAction(player, "menu");
    return;
  }
  if (id.includes("paste")) {
    runFcAction(player, "paste");
    return;
  }

  runFcAction(player, "help");
}

function registerScriptEventHandlers() {
  const scriptEventSignal =
    system.afterEvents?.scriptEventReceive ?? world.afterEvents?.scriptEventReceive;
  if (!scriptEventSignal) {
    console.warn("[FC] scriptEventReceive not available");
    return;
  }

  scriptEventSignal.subscribe((event) => {
    system.run(() => {
      handleScriptEvent(event.id, event.sourceEntity);
    });
  });
  console.warn("[FC] registered /scriptevent fc:* handler");
}

/**
 * @param {import("@minecraft/server").StartupEvent} initEvent
 */
function registerFcCustomCommands(initEvent) {
  const registry = initEvent?.customCommandRegistry;
  if (!registry?.registerCommand) {
    console.warn("[FC] customCommandRegistry unavailable — use /function fc/* or /scriptevent fc:*");
    return;
  }

  const specs = [
    ["fc:give", "Give copy and paste wands", "give"],
    ["fc:menu", "Open copy height menu", "menu"],
    ["fc:copy", "Open copy height menu", "menu"],
    ["fc:paste", "Paste copied column", "paste"],
    ["fc:help", "Show Floor Column Copy help", "help"],
  ];

  for (const [name, description, action] of specs) {
    registry.registerCommand(
      {
        name,
        description: `FC: ${description}`,
        permissionLevel: 0,
        cheatsRequired: false,
      },
      (origin) => {
        const entity = origin?.sourceEntity;
        system.run(() => {
          if (entity) {
            runFcAction(entity, action);
          }
        });
        return { status: 0 };
      },
    );
  }

  console.warn("[FC] registered slash commands: /fc:give, /fc:menu, /fc:paste");
}

function registerStartupHandlers() {
  if (startupRegistered) {
    return;
  }

  const startup = system.beforeEvents?.startup;
  if (!startup) {
    console.warn("[FC] startup event unavailable");
    return;
  }

  startupRegistered = true;
  startup.subscribe((initEvent) => {
    registerFcCustomCommands(initEvent);

    const itemRegistry = initEvent?.itemComponentRegistry;
    if (!itemRegistry?.registerCustomComponent) {
      console.warn("[FC] itemComponentRegistry unavailable");
      return;
    }

    itemRegistry.registerCustomComponent("floor_column_copy:copy_action", {
      onUse(event) {
        const player = event.source;
        if (!player?.isValid) {
          return;
        }
        system.run(() => handleWandUse(player, event.itemStack));
      },
    });

    itemRegistry.registerCustomComponent("floor_column_copy:paste_action", {
      onUse(event) {
        const player = event.source;
        if (!player?.isValid) {
          return;
        }
        system.run(() => handleWandUse(player, event.itemStack));
      },
    });

    console.warn("[FC] registered item components: copy_action, paste_action");
  });
}

function registerGameEvents() {
  if (gameEventsRegistered) {
    return;
  }

  registerItemUseHandlers();
  registerWandBlockInteractHandlers();
  registerChatHandlers();
  registerScriptEventHandlers();
  gameEventsRegistered = true;
  console.warn("[FC] game events registered");
}

/**
 * @param {import("@minecraft/server").Player} player
 */
function getReadyLines(player) {
  const messages = getMessages(player);
  const lines = [messages.ready, messages.readyHintUse, messages.readyHintGive];
  if (chatHandlerMode === "none") {
    lines.push(messages.readyHintBeta);
  }
  return lines;
}

function announceReady() {
  for (const player of world.getPlayers()) {
    try {
      for (const line of getReadyLines(player)) {
        sendFc(player, line);
      }
    } catch (error) {
      console.warn(`[FC] ready message failed: ${error?.message ?? error}`);
    }
  }
}

function onAddonReady() {
  if (!addonReadyDone) {
    try {
      registerGameEvents();
      addonReadyDone = true;
      console.warn(`[FC] addon active (pack ${CONFIG.packVersion})`);
      announceReady();
    } catch (error) {
      console.warn(`[FC] startup failed: ${error?.message ?? error}`);
      try {
        registerGameEvents();
      } catch (registerError) {
        console.warn(`[FC] registerGameEvents retry failed: ${registerError?.message ?? registerError}`);
      }
    }
  }

  for (const player of world.getPlayers()) {
    tryGiveStarterWands(player);
  }
}

function scheduleAddonReady() {
  system.run(() => onAddonReady());
}

function bootstrapFcScript() {
  console.warn(`[FC] bootstrap (pack ${CONFIG.packVersion})`);
  try {
    registerStartupHandlers();
  } catch (error) {
    console.warn(`[FC] bootstrap startup: ${error?.message ?? error}`);
  }

  try {
    registerGameEvents();
  } catch (error) {
    console.warn(`[FC] bootstrap registerGameEvents: ${error?.message ?? error}`);
  }

  scheduleAddonReady();
  system.runTimeout(scheduleAddonReady, 40);
  system.runTimeout(scheduleAddonReady, 100);
}

bootstrapFcScript();

if (world.afterEvents?.worldLoad) {
  world.afterEvents.worldLoad.subscribe(() => scheduleAddonReady());
}

world.afterEvents.playerSpawn.subscribe((event) => {
  scheduleAddonReady();

  if (!event.initialSpawn) {
    return;
  }

  system.run(() => {
    const player = event.player;
    if (!player?.isValid) {
      return;
    }

    for (const line of getReadyLines(player)) {
      sendFc(player, line);
    }

    tryGiveStarterWands(player);
    system.runTimeout(() => tryGiveStarterWands(player), 40);
    system.runTimeout(() => tryGiveStarterWands(player), 100);
  });
});
