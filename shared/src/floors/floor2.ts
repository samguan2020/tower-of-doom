import type { FloorDef } from "../types.js";

// (6,4) is a 1-tile bonus vault: sealed by a GATE at (5,4), held open only
// while a player stands on the PLATE at (3,4). Optional side room, not on
// the critical path to the stairs — see GDD "Detailed Rules" for the
// co-op-vs-solo tradeoff this creates.
export const floor2: FloorDef = {
  id: 2,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", "#", "B", "#", "#", "#", "#", "#"],
    ["#", ".", ".", "P", ".", "G", ".", "#"],
    ["#", ".", ".", ".", ".", ".", "#", "#"],
    ["#", "D", ".", ".", ".", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f2_goblin", x: 4, y: 6, name: "哥布林", hp: 35, atk: 10, def: 4, goldReward: 20 },
    { id: "f2_bat2", x: 5, y: 1, name: "大蝙蝠", hp: 25, atk: 8, def: 3, goldReward: 15 },
  ],
  items: [
    { id: "f2_key1", x: 3, y: 5, type: "key_blue", value: 1 },
    { id: "f2_pot1", x: 2, y: 1, type: "potion_big", value: 60 },
    { id: "f2_shield1", x: 5, y: 2, type: "shield", value: 3 },
    { id: "f2_vault_gold", x: 6, y: 4, type: "gold", value: 50 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
