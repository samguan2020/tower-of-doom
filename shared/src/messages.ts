/** Client -> server message: attempt to move one tile in a cardinal direction. */
export interface MoveMessage {
  dx: -1 | 0 | 1;
  dy: -1 | 0 | 1;
}

/** Server -> client one-shot events (combat results, floor transitions, victory). */
export type ServerEvent =
  | { type: "combat"; monsterName: string; won: boolean; damageTaken: number; goldReward: number }
  | { type: "unwinnable"; monsterName: string }
  | { type: "floorChange"; floorId: number }
  | { type: "victory" }
  | { type: "itemPickup"; itemType: string; value: number };
