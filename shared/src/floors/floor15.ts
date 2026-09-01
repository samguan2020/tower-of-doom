import type { FloorDef } from "../types.js";

// End of this batch's content (floors 16-50 still to come) — the stairs here
// currently trigger victory only because this is the last entry in floors[];
// that will stop being true once floor16 is added.
export const floor15: FloorDef = {
  id: 15,
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
    { id: "f15_direimp", x: 2, y: 2, name: "深渊小鬼", hp: 140, atk: 60, def: 24, goldReward: 220 },
    { id: "f15_subboss", x: 5, y: 4, name: "深渊魔将", hp: 192, atk: 64, def: 28, goldReward: 300 },
  ],
  items: [
    { id: "f15_sword8", x: 1, y: 4, type: "sword", value: 9 },
    { id: "f15_potbig", x: 3, y: 1, type: "potion_big", value: 180 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
