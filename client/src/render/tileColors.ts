import { TileType } from "@tower/shared";

export const TILE_COLORS: Record<string, number> = {
  [TileType.WALL]: 0x2b2438,
  [TileType.FLOOR]: 0x3a3350,
  [TileType.STAIR_UP]: 0x5cb85c,
  [TileType.STAIR_DOWN]: 0x5c8ab5,
  [TileType.DOOR_YELLOW]: 0xd4af37,
  [TileType.DOOR_BLUE]: 0x4169e1,
  [TileType.DOOR_RED]: 0xb22222,
};

export const ITEM_GLYPH: Record<string, string> = {
  potion_small: "药",
  potion_big: "丹",
  sword: "剑",
  shield: "盾",
  gold: "金",
  key_yellow: "钥",
  key_blue: "钥",
  key_red: "钥",
};

export const ITEM_COLORS: Record<string, number> = {
  potion_small: 0x52b788,
  potion_big: 0x2d6a4f,
  sword: 0xc9184a,
  shield: 0x4361ee,
  gold: 0xffd60a,
  key_yellow: 0xd4af37,
  key_blue: 0x4169e1,
  key_red: 0xb22222,
};
