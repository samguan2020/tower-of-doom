import type { FloorDef } from "../types.js";

// Checkpoint floor. Bottom area (D, small monster, key, shield) connects to the
// top area (sub-boss + big potion) only through the red door at (2,3). The
// gold vault at (6,4) needs a player holding the plate (3,4) while the other
// crosses the gate (5,4) — same co-op pattern as floor 2.
export const floor10: FloorDef = {
  id: 10,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", ".", ".", ".", ".", ".", ".", "#"],
    ["#", "#", "R", "#", "#", "#", "#", "#"],
    ["#", ".", ".", "P", ".", "G", ".", "#"],
    ["#", ".", ".", ".", ".", ".", "#", "#"],
    ["#", "D", ".", ".", ".", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f10_smallbeast", x: 4, y: 6, name: "地穴野兽", hp: 105, atk: 40, def: 16, goldReward: 130 },
    { id: "f10_towerguardian", x: 4, y: 2, name: "魔塔卫兵", hp: 120, atk: 44, def: 22, goldReward: 200 },
  ],
  items: [
    { id: "f10_key1", x: 2, y: 5, type: "key_red", value: 1 },
    { id: "f10_shield6", x: 1, y: 4, type: "shield", value: 7 },
    { id: "f10_potbig", x: 2, y: 1, type: "potion_big", value: 150 },
    { id: "f10_vaultgold", x: 6, y: 4, type: "gold", value: 150 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
