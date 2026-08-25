import type { KeyColorId, TileCode } from "./tileTypes.js";

export type ItemType =
  | "potion_small"
  | "potion_big"
  | "sword"
  | "shield"
  | "gold"
  | `key_${KeyColorId}`;

export interface MonsterDef {
  id: string;
  x: number;
  y: number;
  name: string;
  hp: number;
  atk: number;
  def: number;
  goldReward: number;
}

export interface ItemDef {
  id: string;
  x: number;
  y: number;
  type: ItemType;
  /** HP restored (potions), stat gained (sword=atk, shield=def), or gold amount. */
  value: number;
}

export interface FloorDef {
  id: number;
  width: number;
  height: number;
  /** tiles[y][x], see TileType codes. */
  tiles: TileCode[][];
  monsters: MonsterDef[];
  items: ItemDef[];
  /** Grid position players land on when arriving via the "up" stair from the floor below. */
  spawnFromBelow: { x: number; y: number };
  /** Grid position players land on when arriving via the "down" stair from the floor above. */
  spawnFromAbove: { x: number; y: number };
}

export interface CombatantStats {
  hp: number;
  atk: number;
  def: number;
}

export interface CombatResult {
  winnable: boolean;
  /** HP the player loses if they fight (only meaningful when winnable). */
  playerDamageTaken: number;
  /** Number of player attacks needed to kill the monster. */
  turns: number;
}
