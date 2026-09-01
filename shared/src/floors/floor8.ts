import type { FloorDef } from "../types.js";

export const floor8: FloorDef = {
  id: 8,
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
    { id: "f8_frostgiant", x: 2, y: 1, name: "冰霜巨人", hp: 84, atk: 36, def: 16, goldReward: 100 },
    { id: "f8_abyssguard", x: 5, y: 3, name: "深渊守卫", hp: 80, atk: 38, def: 14, goldReward: 110 },
  ],
  items: [
    { id: "f8_shield5", x: 1, y: 4, type: "shield", value: 6 },
    { id: "f8_potbig", x: 4, y: 2, type: "potion_big", value: 130 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
