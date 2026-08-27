import { Client, getStateCallbacks, type Room } from "colyseus.js";
import { ROOM_NAME, TowerState, type CharacterId, type ServerEvent } from "@tower/shared";

function resolveServerUrl(): string {
  const fromEnv = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return `ws://${location.hostname}:2567`;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${location.host}`;
}

export async function joinTowerRoom(name: string, character: CharacterId): Promise<Room<TowerState>> {
  const client = new Client(resolveServerUrl());
  return client.joinOrCreate<TowerState>(ROOM_NAME, { name, character });
}

export function watchState(room: Room<TowerState>) {
  return getStateCallbacks(room);
}

export function onServerEvent(room: Room<TowerState>, handler: (event: ServerEvent) => void): void {
  room.onMessage("event", handler);
}
