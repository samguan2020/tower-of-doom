import type { FloorDef } from "../types.js";

// Blue door at (4,1) is the only crossing between the left half (D, key) and
// the right half (U, sword) — get the key before heading right.
export const floor7: FloorDef = {
  id: 7,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", "B", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", "D", ".", ".", "#", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f7_spider", x: 2, y: 2, name: "毒蛛", hp: 60, atk: 34, def: 14, goldReward: 90 },
    { id: "f7_boneknight", x: 5, y: 4, name: "骨骑士", hp: 60, atk: 36, def: 12, goldReward: 95 },
  ],
  items: [
    { id: "f7_key1", x: 2, y: 4, type: "key_blue", value: 1 },
    { id: "f7_pot3", x: 2, y: 5, type: "potion_small", value: 40 },
    { id: "f7_sword4", x: 5, y: 2, type: "sword", value: 6 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
