import { TileType } from "@tower/shared";

export const TILE_COLORS: Record<string, number> = {
  [TileType.WALL]: 0x2b2438,
  [TileType.FLOOR]: 0x3a3350,
  [TileType.STAIR_UP]: 0x5cb85c,
  [TileType.STAIR_DOWN]: 0x5c8ab5,
  [TileType.DOOR_YELLOW]: 0xd4af37,
  [TileType.DOOR_BLUE]: 0x4169e1,
  [TileType.DOOR_RED]: 0xb22222,
  [TileType.PLATE]: 0x8a6d3b,
  [TileType.GATE]: 0x4a3f63,
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

export const ITEM_NAME: Record<string, string> = {
  potion_small: "小型药水",
  potion_big: "大型药水",
  sword: "剑",
  shield: "盾",
  gold: "金币",
  key_yellow: "黄钥匙",
  key_blue: "蓝钥匙",
  key_red: "红钥匙",
};

/** One-line effect description for a tap tooltip or pickup log line. */
export function describeItemEffect(itemType: string, value: number): string {
  switch (itemType) {
    case "potion_small":
    case "potion_big":
      return `恢复 ${value} 点生命`;
    case "sword":
      return `永久 攻击 +${value}`;
    case "shield":
      return `永久 防御 +${value}`;
    case "gold":
      return `获得 ${value} 金币`;
    case "key_yellow":
    case "key_blue":
    case "key_red":
      return "可开启一扇同色的门（用一次消耗）";
    default:
      return "";
  }
}
