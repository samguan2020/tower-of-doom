import type { FloorDef } from "../types.js";

export const floor4: FloorDef = {
  id: 4,
  width: 8,
  height: 8,
  tiles: [
    ["#", "#", "#", "#", "#", "#", "#", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "Y", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", ".", ".", ".", "#", ".", ".", "#"],
    ["#", "D", ".", ".", "#", ".", "U", "#"],
    ["#", "#", "#", "#", "#", "#", "#", "#"],
  ],
  monsters: [
    { id: "f4_ogre", x: 2, y: 2, name: "食人魔", hp: 90, atk: 22, def: 10, goldReward: 60 },
    { id: "f4_specter", x: 6, y: 2, name: "潜行者", hp: 80, atk: 25, def: 8, goldReward: 55 },
  ],
  items: [
    { id: "f4_key1", x: 3, y: 4, type: "key_yellow", value: 1 },
    { id: "f4_pot1", x: 1, y: 1, type: "potion_big", value: 80 },
    { id: "f4_shield2", x: 5, y: 5, type: "shield", value: 6 },
  ],
  spawnFromBelow: { x: 1, y: 6 },
  spawnFromAbove: { x: 6, y: 6 },
};
