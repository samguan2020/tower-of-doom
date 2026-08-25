import type { FloorDef } from "../types.js";

export const floor2: FloorDef = {
  id: 2,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", "#", "B", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
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
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
