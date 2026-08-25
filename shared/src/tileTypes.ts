/** Static terrain codes used in floor JSON `tiles` grids. */
export const TileType = {
  WALL: "#",
  FLOOR: ".",
  STAIR_UP: "U",
  STAIR_DOWN: "D",
  DOOR_YELLOW: "Y",
  DOOR_BLUE: "B",
  DOOR_RED: "R",
} as const;

export type TileCode = (typeof TileType)[keyof typeof TileType];

export const KeyColor = {
  YELLOW: "yellow",
  BLUE: "blue",
  RED: "red",
} as const;

export type KeyColorId = (typeof KeyColor)[keyof typeof KeyColor];

export const DOOR_TILE_TO_KEY: Record<string, KeyColorId> = {
  [TileType.DOOR_YELLOW]: KeyColor.YELLOW,
  [TileType.DOOR_BLUE]: KeyColor.BLUE,
  [TileType.DOOR_RED]: KeyColor.RED,
};
