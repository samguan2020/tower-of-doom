import type { FloorDef } from "../types.js";

export const floor14: FloorDef = {
  id: 14,
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
    { id: "f14_frostwraith", x: 2, y: 4, name: "冰霜怨魂", hp: 168, atk: 56, def: 24, goldReward: 200 },
    { id: "f14_ironsentinel", x: 5, y: 2, name: "钢铁哨兵", hp: 180, atk: 58, def: 22, goldReward: 210 },
  ],
  items: [
    { id: "f14_shield8", x: 1, y: 2, type: "shield", value: 9 },
    { id: "f14_potbig", x: 4, y: 1, type: "potion_big", value: 160 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
