export const STARTING_PLAYER_STATS = {
  hp: 100,
  maxHp: 100,
  atk: 10,
  def: 10,
  gold: 0,
} as const;

export const PLAYER_COLORS = [0xe63946, 0x2a9d8f, 0xf4a261, 0x8338ec, 0x3a86ff, 0xffbe0b] as const;

export const CHARACTER_IDS = ["princess", "warrior"] as const;

export const ROOM_NAME = "tower";

/** This MVP is designed for a single shared tower climbed by 1-2 players. */
export const MAX_PLAYERS = 2;
