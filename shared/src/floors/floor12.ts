import type { FloorDef } from "../types.js";

export const floor12: FloorDef = {
  id: 12,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", "#", "#"],
    ["#", "D", ".", ".", ".", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f12_troll", x: 2, y: 3, name: "巨魔", hp: 120, atk: 48, def: 20, goldReward: 160 },
    { id: "f12_wight", x: 5, y: 2, name: "怨灵", hp: 130, atk: 50, def: 18, goldReward: 170 },
  ],
  items: [
    { id: "f12_shield7", x: 1, y: 1, type: "shield", value: 8 },
    { id: "f12_potbig", x: 4, y: 4, type: "potion_big", value: 150 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
