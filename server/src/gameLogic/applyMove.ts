import {
  DOOR_TILE_TO_KEY,
  FloorState,
  GATE_DECAY_MOVES,
  ItemSchema,
  MonsterSchema,
  type PlayerSchema,
  TOP_FLOOR_ID,
  TileType,
  TowerState,
  getFloor,
  resolveCombat,
  type ServerEvent,
} from "@tower/shared";

/** Lazily materializes the mutable runtime state for a floor from its static definition. */
export function ensureFloorRuntime(state: TowerState, floorId: number): FloorState {
  const key = String(floorId);
  let runtime = state.floors.get(key);
  if (runtime) return runtime;

  runtime = new FloorState();
  const def = getFloor(floorId);

  for (const m of def.monsters) {
    const monster = new MonsterSchema();
    monster.id = m.id;
    monster.x = m.x;
    monster.y = m.y;
    monster.name = m.name;
    monster.hp = m.hp;
    monster.atk = m.atk;
    monster.def = m.def;
    monster.goldReward = m.goldReward;
    runtime.monsters.set(m.id, monster);
  }

  for (const i of def.items) {
    const item = new ItemSchema();
    item.id = i.id;
    item.x = i.x;
    item.y = i.y;
    item.itemType = i.type;
    item.value = i.value;
    runtime.items.set(i.id, item);
  }

  state.floors.set(key, runtime);
  return runtime;
}

function findMonsterAt(floor: FloorState, x: number, y: number): MonsterSchema | undefined {
  for (const monster of floor.monsters.values()) {
    if (monster.x === x && monster.y === y) return monster;
  }
  return undefined;
}

function findItemAt(floor: FloorState, x: number, y: number): ItemSchema | undefined {
  for (const item of floor.items.values()) {
    if (item.x === x && item.y === y) return item;
  }
  return undefined;
}

/** True if any player currently on `floorId` is standing on a PLATE tile. */
function isAnyPlateHeld(state: TowerState, floorId: number, tiles: string[][]): boolean {
  for (const other of state.players.values()) {
    if (other.floorId !== floorId) continue;
    if (tiles[other.y]?.[other.x] === TileType.PLATE) return true;
  }
  return false;
}

/**
 * Recomputes whether this floor's gate(s) are open: held open while any
 * plate is occupied, otherwise decaying closed over GATE_DECAY_MOVES moves.
 */
function updateGateState(state: TowerState, floorId: number, floorRuntime: FloorState, tiles: string[][]): void {
  const held = isAnyPlateHeld(state, floorId, tiles);
  if (held) {
    floorRuntime.gateDecay = GATE_DECAY_MOVES;
  } else if (floorRuntime.gateDecay > 0) {
    floorRuntime.gateDecay -= 1;
  }
  floorRuntime.gateOpen = held || floorRuntime.gateDecay > 0;
}

function grantKey(player: PlayerSchema, color: string, delta: number): void {
  if (color === "yellow") player.keysYellow += delta;
  else if (color === "blue") player.keysBlue += delta;
  else if (color === "red") player.keysRed += delta;
}

function hasKey(player: PlayerSchema, color: string): boolean {
  if (color === "yellow") return player.keysYellow > 0;
  if (color === "blue") return player.keysBlue > 0;
  if (color === "red") return player.keysRed > 0;
  return false;
}

function applyItem(player: PlayerSchema, item: ItemSchema): void {
  switch (item.itemType) {
    case "potion_small":
    case "potion_big":
      player.hp = Math.min(player.hp + item.value, player.maxHp);
      break;
    case "sword":
      player.atk += item.value;
      break;
    case "shield":
      player.def += item.value;
      break;
    case "gold":
      player.gold += item.value;
      break;
    case "key_yellow":
      grantKey(player, "yellow", item.value);
      break;
    case "key_blue":
      grantKey(player, "blue", item.value);
      break;
    case "key_red":
      grantKey(player, "red", item.value);
      break;
  }
}

/**
 * Resolves a one-tile move for `player` against the authoritative room state.
 * Mutates `state` in place; returns the event(s) to send back to the acting client.
 */
export function applyMove(
  state: TowerState,
  player: PlayerSchema,
  dx: -1 | 0 | 1,
  dy: -1 | 0 | 1,
): ServerEvent[] {
  if (player.victorious) return [];

  const floorDef = getFloor(player.floorId);
  const nx = player.x + dx;
  const ny = player.y + dy;
  if (nx < 0 || ny < 0 || nx >= floorDef.width || ny >= floorDef.height) return [];

  const floorRuntime = ensureFloorRuntime(state, player.floorId);
  updateGateState(state, player.floorId, floorRuntime, floorDef.tiles);

  const tile = floorDef.tiles[ny][nx];
  if (tile === TileType.WALL) return [];
  if (tile === TileType.GATE && !floorRuntime.gateOpen) return [];

  const doorKeyColor = DOOR_TILE_TO_KEY[tile];
  if (doorKeyColor) {
    const doorKey = `${nx},${ny}`;
    if (!floorRuntime.doorsOpen.get(doorKey)) {
      if (!hasKey(player, doorKeyColor)) return [];
      grantKey(player, doorKeyColor, -1);
      floorRuntime.doorsOpen.set(doorKey, true);
    }
  }

  const monster = findMonsterAt(floorRuntime, nx, ny);
  if (monster) {
    const result = resolveCombat(
      { hp: player.hp, atk: player.atk, def: player.def },
      { hp: monster.hp, atk: monster.atk, def: monster.def },
    );
    if (!result.winnable) {
      return [{ type: "unwinnable", monsterName: monster.name }];
    }
    player.hp -= result.playerDamageTaken;
    player.gold += monster.goldReward;
    floorRuntime.monsters.delete(monster.id);
    player.x = nx;
    player.y = ny;
    return [
      {
        type: "combat",
        monsterName: monster.name,
        won: true,
        damageTaken: result.playerDamageTaken,
        goldReward: monster.goldReward,
      },
    ];
  }

  const item = findItemAt(floorRuntime, nx, ny);
  if (item) {
    applyItem(player, item);
    const itemType = item.itemType;
    const value = item.value;
    floorRuntime.items.delete(item.id);
    player.x = nx;
    player.y = ny;
    return [{ type: "itemPickup", itemType, value }];
  }

  if (tile === TileType.STAIR_UP) {
    if (player.floorId === TOP_FLOOR_ID) {
      player.x = nx;
      player.y = ny;
      player.victorious = true;
      return [{ type: "victory" }];
    }
    const nextFloor = getFloor(player.floorId + 1);
    ensureFloorRuntime(state, nextFloor.id);
    player.floorId = nextFloor.id;
    player.x = nextFloor.spawnFromBelow.x;
    player.y = nextFloor.spawnFromBelow.y;
    return [{ type: "floorChange", floorId: nextFloor.id }];
  }

  if (tile === TileType.STAIR_DOWN) {
    const prevFloor = getFloor(player.floorId - 1);
    ensureFloorRuntime(state, prevFloor.id);
    player.floorId = prevFloor.id;
    player.x = prevFloor.spawnFromAbove.x;
    player.y = prevFloor.spawnFromAbove.y;
    return [{ type: "floorChange", floorId: prevFloor.id }];
  }

  player.x = nx;
  player.y = ny;
  return [];
}
