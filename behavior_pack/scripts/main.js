import { world, system } from "@minecraft/server";

const HISTORY_TICKS = 20 * 15;
const REWIND_RADIUS = 32;
const ROLL_CHANCE = 0.10;
const VOICE_SOUND = "rbd.death_voice";
const histories = new Map();
const pendingReturns = new Map();
const tick = () => system.currentTick;

function record(entity) {
  try {
    const key = entity.id;
    const dimensionId = entity.dimension.id;
    let history = histories.get(key);
    if (!history || history.dimensionId !== dimensionId) {
      history = { dimensionId, positions: [] };
      histories.set(key, history);
    }
    history.positions.push({ time: tick(), location: { ...entity.location } });
    const cutoff = tick() - HISTORY_TICKS;
    while (history.positions.length && history.positions[0].time < cutoff) history.positions.shift();
  } catch {}
}

function findReturnPoint(entity) {
  const history = histories.get(entity.id);
  if (!history || history.dimensionId !== entity.dimension.id) return undefined;
  const targetTime = tick() - HISTORY_TICKS;
  let selected;
  for (const entry of history.positions) {
    if (entry.time <= targetTime) selected = entry;
    else break;
  }
  return selected ? { ...selected.location } : undefined;
}

world.afterEvents.playerSpawn.subscribe(({ player, initialSpawn }) => {
  if (initialSpawn) {
    try {
      if (player.getDynamicProperty("rbd_granted") !== true) {
        const won = Math.random() < ROLL_CHANCE;
        player.setDynamicProperty("rbd_granted", true);
        player.setDynamicProperty("rbd_ability", won);
        player.sendMessage(won
          ? "§5A power stirs beyond death. Return by Death is yours."
          : "§7The roll passed. No power stirred this time.");
      }
    } catch {}
    return;
  }

  const saved = pendingReturns.get(player.id);
  if (!saved) return;
  pendingReturns.delete(player.id);
  system.runTimeout(() => {
    try {
      if (!player.isValid) return;
      const dimension = world.getDimension(saved.dimensionId);
      const nearby = dimension.getEntities({ location: saved.location, maxDistance: REWIND_RADIUS });
      for (const entity of nearby) {
        if (entity.typeId === "minecraft:player") continue;
        const location = findReturnPoint(entity);
        if (!location) continue;
        try { entity.teleport(location, { dimension, checkForBlocks: false }); } catch {}
      }
      player.teleport(saved.location, { dimension, checkForBlocks: false });
      player.sendMessage("§5Return by Death: the last 15 seconds have been rewound.");
    } catch {
      try { player.sendMessage("§cReturn by Death could not complete in this situation."); } catch {}
    }
  }, 1);
});

world.afterEvents.entityDie.subscribe(({ deadEntity }) => {
  if (deadEntity.typeId !== "minecraft:player") return;
  try {
    if (deadEntity.getDynamicProperty("rbd_ability") !== true) return;
    const location = findReturnPoint(deadEntity);
    if (!location) {
      try { deadEntity.playSound(VOICE_SOUND, { volume: 1, pitch: 1 }); } catch {}
      deadEntity.sendMessage("§7Return by Death needs 15 seconds of recorded history; this death cannot be rewound.");
      return;
    }
    pendingReturns.set(deadEntity.id, { location, dimensionId: deadEntity.dimension.id });
    try { deadEntity.playSound(VOICE_SOUND, { volume: 1, pitch: 1 }); } catch {}
  } catch {}
});

system.runInterval(() => {
  for (const player of world.getAllPlayers()) record(player);
  for (const dimensionId of ["overworld", "nether", "the_end"]) {
    try {
      for (const entity of world.getDimension(dimensionId).getEntities()) {
        if (entity.typeId !== "minecraft:player") record(entity);
      }
    } catch {}
  }
}, 1);
