import type { FloorDef } from "../types.js";
import { floor1 } from "./floor1.js";
import { floor2 } from "./floor2.js";
import { floor3 } from "./floor3.js";
import { floor4 } from "./floor4.js";
import { floor5 } from "./floor5.js";
import { floor6 } from "./floor6.js";
import { floor7 } from "./floor7.js";
import { floor8 } from "./floor8.js";
import { floor9 } from "./floor9.js";
import { floor10 } from "./floor10.js";
import { floor11 } from "./floor11.js";
import { floor12 } from "./floor12.js";
import { floor13 } from "./floor13.js";
import { floor14 } from "./floor14.js";
import { floor15 } from "./floor15.js";

export const floors: FloorDef[] = [
  floor1,
  floor2,
  floor3,
  floor4,
  floor5,
  floor6,
  floor7,
  floor8,
  floor9,
  floor10,
  floor11,
  floor12,
  floor13,
  floor14,
  floor15,
];
export const TOP_FLOOR_ID = floors[floors.length - 1].id;

export function getFloor(id: number): FloorDef {
  const floor = floors.find((f) => f.id === id);
  if (!floor) {
    throw new Error(`Unknown floor id: ${id}`);
  }
  return floor;
}
