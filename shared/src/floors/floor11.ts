import type { FloorDef } from "../types.js";

export const floor11: FloorDef = {
  id: 11,
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
    { id: "f11_direwolf", x: 2, y: 2, name: "恐狼", hp: 114, atk: 46, def: 18, goldReward: 140 },
    { id: "f11_harpy", x: 5, y: 4, name: "鹰身女妖", hp: 105, atk: 48, def: 16, goldReward: 150 },
  ],
  items: [
    { id: "f11_sword7", x: 1, y: 3, type: "sword", value: 7 },
    { id: "f11_potbig", x: 4, y: 1, type: "potion_big", value: 140 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
