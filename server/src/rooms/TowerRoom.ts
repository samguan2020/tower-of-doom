import { Room, type Client } from "@colyseus/core";
import {
  PLAYER_COLORS,
  PlayerSchema,
  STARTING_PLAYER_STATS,
  TowerState,
  getFloor,
  type MoveMessage,
} from "@tower/shared";
import { applyMove, ensureFloorRuntime } from "../gameLogic/applyMove.js";

interface JoinOptions {
  name?: string;
}

export class TowerRoom extends Room<TowerState> {
  maxClients = 8;

  onCreate(): void {
    this.setState(new TowerState());
    ensureFloorRuntime(this.state, 1);

    this.onMessage("move", (client, message: MoveMessage) => {
      const player = this.state.players.get(client.sessionId);
      if (!player) return;
      if (typeof message?.dx !== "number" || typeof message?.dy !== "number") return;
      if (Math.abs(message.dx) > 1 || Math.abs(message.dy) > 1) return;

      const events = applyMove(this.state, player, message.dx, message.dy);
      for (const event of events) {
        client.send("event", event);
      }
    });
  }

  onJoin(client: Client, options: JoinOptions): void {
    const floor1 = getFloor(1);
    const player = new PlayerSchema();
    player.name = options?.name?.slice(0, 16) || `勇者${client.sessionId.slice(0, 4)}`;
    player.color = PLAYER_COLORS[this.state.players.size % PLAYER_COLORS.length];
    player.floorId = floor1.id;
    player.x = floor1.spawnFromBelow.x;
    player.y = floor1.spawnFromBelow.y;
    player.hp = STARTING_PLAYER_STATS.hp;
    player.maxHp = STARTING_PLAYER_STATS.maxHp;
    player.atk = STARTING_PLAYER_STATS.atk;
    player.def = STARTING_PLAYER_STATS.def;
    player.gold = STARTING_PLAYER_STATS.gold;

    this.state.players.set(client.sessionId, player);
  }

  onLeave(client: Client): void {
    this.state.players.delete(client.sessionId);
  }
}
