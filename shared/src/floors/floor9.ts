import type { FloorDef } from "../types.js";

// Yellow door at (4,1) gates the right half (U, sword) — grab the key on the left first.
export const floor9: FloorDef = {
  id: 9,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", "Y", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", "D", ".", ".", "#", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f9_sanddemon", x: 2, y: 2, name: "沙尘恶魔", hp: 84, atk: 40, def: 16, goldReward: 115 },
    { id: "f9_stonegolem", x: 5, y: 3, name: "石魔像", hp: 80, atk: 42, def: 14, goldReward: 120 },
  ],
  items: [
    { id: "f9_key1", x: 2, y: 4, type: "key_yellow", value: 1 },
    { id: "f9_pot5", x: 3, y: 2, type: "potion_small", value: 50 },
    { id: "f9_sword5", x: 5, y: 5, type: "sword", value: 7 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
