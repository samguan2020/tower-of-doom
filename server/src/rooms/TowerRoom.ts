import { Room, type Client } from "@colyseus/core";
import {
  CHARACTER_IDS,
  MAX_PLAYERS,
  PLAYER_COLORS,
  PlayerSchema,
  STARTING_PLAYER_STATS,
  TowerState,
  getFloor,
  type CharacterId,
  type MoveMessage,
} from "@tower/shared";
import { applyMove, ensureFloorRuntime } from "../gameLogic/applyMove.js";

// Mobile browsers suspend/close background WebSocket connections aggressively
// (app switching, screen lock). Give a generous grace period before actually
// dropping the player, so the client can reconnect with its session intact.
const RECONNECTION_GRACE_SECONDS = 300;

interface JoinOptions {
  name?: string;
  character?: CharacterId;
}

function resolveCharacter(character: unknown): CharacterId {
  return (CHARACTER_IDS as readonly string[]).includes(character as string)
    ? (character as CharacterId)
    : "warrior";
}

export class TowerRoom extends Room<TowerState> {
  maxClients = MAX_PLAYERS;

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
    player.character = resolveCharacter(options?.character);
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

  async onLeave(client: Client, consented: boolean): Promise<void> {
    if (consented) {
      this.state.players.delete(client.sessionId);
      return;
    }

    try {
      await this.allowReconnection(client, RECONNECTION_GRACE_SECONDS);
      // client reconnected in time — player stays in this.state.players
    } catch {
      this.state.players.delete(client.sessionId);
    }
  }
}
