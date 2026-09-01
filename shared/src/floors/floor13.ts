import type { FloorDef } from "../types.js";

// Red door at (4,1) gates the right half (U, sword) — grab the key on the left first.
export const floor13: FloorDef = {
  id: 13,
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
    { id: "f13_bonewraith", x: 2, y: 2, name: "尸骨幽魂", hp: 132, atk: 52, def: 22, goldReward: 180 },
    { id: "f13_direwarden", x: 5, y: 4, name: "地狱守卫", hp: 144, atk: 54, def: 20, goldReward: 190 },
  ],
  items: [
    { id: "f13_key1", x: 2, y: 3, type: "key_red", value: 1 },
    { id: "f13_pot6", x: 3, y: 5, type: "potion_small", value: 60 },
    { id: "f13_sword6", x: 5, y: 2, type: "sword", value: 8 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
