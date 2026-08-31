import { Client, getStateCallbacks, type Room } from "colyseus.js";
import { ROOM_NAME, TowerState, type CharacterId, type ServerEvent } from "@tower/shared";

const RECONNECTION_TOKEN_KEY = "tower-of-doom:reconnectionToken";

function resolveServerUrl(): string {
  const fromEnv = import.meta.env.VITE_SERVER_URL as string | undefined;
  if (fromEnv) return fromEnv;
  if (import.meta.env.DEV) return `ws://${location.hostname}:2567`;
  const protocol = location.protocol === "https:" ? "wss" : "ws";
  return `${protocol}://${location.host}`;
}

function saveReconnectionToken(token: string): void {
  try {
    sessionStorage.setItem(RECONNECTION_TOKEN_KEY, token);
  } catch {
    // sessionStorage unavailable (e.g. private browsing) — reconnection just won't be offered
  }
}

export function loadReconnectionToken(): string | null {
  try {
    return sessionStorage.getItem(RECONNECTION_TOKEN_KEY);
  } catch {
    return null;
  }
}

export function clearReconnectionToken(): void {
  try {
    sessionStorage.removeItem(RECONNECTION_TOKEN_KEY);
  } catch {
    // ignore
  }
}

export async function joinTowerRoom(name: string, character: CharacterId): Promise<Room<TowerState>> {
  const client = new Client(resolveServerUrl());
  const room = await client.joinOrCreate<TowerState>(ROOM_NAME, { name, character });
  saveReconnectionToken(room.reconnectionToken);
  return room;
}

/** Rejoins a room the client was previously connected to, using the token saved by joinTowerRoom(). */
export async function reconnectTowerRoom(): Promise<Room<TowerState>> {
  const token = loadReconnectionToken();
  if (!token) throw new Error("没有可用的重连凭证");
  const client = new Client(resolveServerUrl());
  const room = await client.reconnect<TowerState>(token);
  saveReconnectionToken(room.reconnectionToken);
  return room;
}

export function watchState(room: Room<TowerState>) {
  return getStateCallbacks(room);
}

export function onServerEvent(room: Room<TowerState>, handler: (event: ServerEvent) => void): void {
  room.onMessage("event", handler);
}
