import type { FloorDef } from "../types.js";

// Legend: # wall, . floor, U stair up, D stair down, Y/B/R locked doors
export const floor1: FloorDef = {
  id: 1,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "Y", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f1_slime", x: 2, y: 4, name: "史莱姆", hp: 20, atk: 5, def: 2, goldReward: 10 },
    { id: "f1_bat", x: 6, y: 3, name: "蝙蝠", hp: 15, atk: 6, def: 1, goldReward: 8 },
  ],
  items: [
    { id: "f1_key1", x: 3, y: 1, type: "key_yellow", value: 1 },
    { id: "f1_pot1", x: 1, y: 2, type: "potion_small", value: 30 },
    { id: "f1_sword1", x: 5, y: 5, type: "sword", value: 3 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
