import { MapSchema, Schema, type } from "@colyseus/schema";

export class PlayerSchema extends Schema {
  @type("string") name = "";
  @type("number") color = 0;
  @type("number") x = 0;
  @type("number") y = 0;
  @type("number") floorId = 1;
  @type("number") hp = 0;
  @type("number") maxHp = 0;
  @type("number") atk = 0;
  @type("number") def = 0;
  @type("number") gold = 0;
  @type("number") keysYellow = 0;
  @type("number") keysBlue = 0;
  @type("number") keysRed = 0;
  @type("boolean") victorious = false;
}

export class MonsterSchema extends Schema {
  @type("string") id = "";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("string") name = "";
  @type("number") hp = 0;
  @type("number") atk = 0;
  @type("number") def = 0;
  @type("number") goldReward = 0;
}

export class ItemSchema extends Schema {
  @type("string") id = "";
  @type("number") x = 0;
  @type("number") y = 0;
  @type("string") itemType = "";
  @type("number") value = 0;
}

export class FloorState extends Schema {
  @type({ map: MonsterSchema }) monsters = new MapSchema<MonsterSchema>();
  @type({ map: ItemSchema }) items = new MapSchema<ItemSchema>();
  /** Keyed by "x,y" of the door tile; presence with value true means opened/consumed. */
  @type({ map: "boolean" }) doorsOpen = new MapSchema<boolean>();
}

export class TowerState extends Schema {
  @type({ map: PlayerSchema }) players = new MapSchema<PlayerSchema>();
  @type({ map: FloorState }) floors = new MapSchema<FloorState>();
}
