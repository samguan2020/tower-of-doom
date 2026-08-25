import type { FloorDef } from "../types.js";
import { floor1 } from "./floor1.js";
import { floor2 } from "./floor2.js";
import { floor3 } from "./floor3.js";
import { floor4 } from "./floor4.js";
import { floor5 } from "./floor5.js";

export const floors: FloorDef[] = [floor1, floor2, floor3, floor4, floor5];
export const TOP_FLOOR_ID = floors[floors.length - 1].id;

export function getFloor(id: number): FloorDef {
  const floor = floors.find((f) => f.id === id);
  if (!floor) {
    throw new Error(`Unknown floor id: ${id}`);
  }
  return floor;
}
