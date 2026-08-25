import type { FloorDef } from "../types.js";

export const floor3: FloorDef = {
  id: 3,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", "R", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", "D", ".", ".", "#", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f3_orc", x: 2, y: 3, name: "兽人", hp: 60, atk: 15, def: 8, goldReward: 35 },
    { id: "f3_wraith", x: 6, y: 4, name: "幽魂", hp: 50, atk: 18, def: 6, goldReward: 40 },
  ],
  items: [
    { id: "f3_key1", x: 3, y: 2, type: "key_red", value: 1 },
    { id: "f3_pot1", x: 1, y: 4, type: "potion_big", value: 60 },
    { id: "f3_sword2", x: 5, y: 5, type: "sword", value: 5 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
