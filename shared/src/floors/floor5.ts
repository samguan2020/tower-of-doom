import type { FloorDef } from "../types.js";

// Top floor: the boss ("f5_boss") stands in the only tile adjacent to the
// stair-up ("U"), which acts as the victory tile — the server declares
// victory instead of transitioning to a floor 6 that doesn't exist.
export const floor5: FloorDef = {
  id: 5,
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
    { id: "f5_boss", x: 5, y: 6, name: "魔王", hp: 250, atk: 35, def: 15, goldReward: 200 },
  ],
  items: [
    { id: "f5_pot1", x: 2, y: 2, type: "potion_big", value: 100 },
    { id: "f5_sword3", x: 4, y: 3, type: "sword", value: 8 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
