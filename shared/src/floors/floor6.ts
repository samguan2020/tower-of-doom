import type { FloorDef } from "../types.js";

export const floor6: FloorDef = {
  id: 6,
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
    { id: "f6_stoneman", x: 3, y: 2, name: "石头人", hp: 70, atk: 30, def: 14, goldReward: 80 },
    { id: "f6_shadow", x: 5, y: 4, name: "暗影兵", hp: 60, atk: 32, def: 12, goldReward: 85 },
  ],
  items: [
    { id: "f6_shield4", x: 1, y: 3, type: "shield", value: 5 },
    { id: "f6_pot2", x: 4, y: 1, type: "potion_big", value: 110 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
