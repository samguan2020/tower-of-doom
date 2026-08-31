import type { CharacterId } from "@tower/shared";
import type { Room } from "colyseus.js";
import type { TowerState } from "@tower/shared";
import Phaser from "phaser";
import { CHARACTER_SVG, rasterizeCharacterIcons } from "./render/characterArt.js";
import { clearReconnectionToken, joinTowerRoom, loadReconnectionToken, reconnectTowerRoom } from "./net/NetworkClient.js";
import { GameScene } from "./scenes/GameScene.js";

const lobby = document.getElementById("lobby") as HTMLDivElement;
const app = document.getElementById("app") as HTMLDivElement;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const joinBtn = document.getElementById("joinBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const errorBanner = document.getElementById("errorBanner") as HTMLDivElement;
const charCards = document.querySelectorAll<HTMLButtonElement>(".charCard");

let selectedCharacter: CharacterId | undefined;

document.getElementById("iconPrincess")!.innerHTML = CHARACTER_SVG.princess;
document.getElementById("iconWarrior")!.innerHTML = CHARACTER_SVG.warrior;

charCards.forEach((card) => {
  card.addEventListener("click", () => {
    selectedCharacter = card.dataset.character as CharacterId;
    charCards.forEach((c) => c.classList.toggle("selected", c === card));
    joinBtn.disabled = false;
  });
});

function reportError(text: string): void {
  errorBanner.style.display = "block";
  const line = document.createElement("div");
  line.textContent = text;
  errorBanner.appendChild(line);
}

window.addEventListener("error", (e) => {
  reportError(`页面错误: ${e.message} (${e.filename ?? ""}:${e.lineno ?? ""})`);
});
window.addEventListener("unhandledrejection", (e) => {
  reportError(`未处理的错误: ${String(e.reason)}`);
});

function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error(`超时(${ms / 1000}秒)未连上服务器`)), ms)),
  ]);
}

function startGame(room: Room<TowerState>, characterIcons: Record<CharacterId, HTMLCanvasElement>): void {
  lobby.style.display = "none";
  app.style.display = "flex";

  const config: Phaser.Types.Core.GameConfig = {
    type: Phaser.AUTO,
    parent: "gameContainer",
    backgroundColor: "#14121a",
    // The game has no sound assets; skip Phaser's WebAudio setup entirely so mobile
    // browsers don't throw "failed to start the audio device" when the AudioContext
    // tries to auto-resume after the app returns from the background.
    audio: { noAudio: true },
    scale: {
      mode: Phaser.Scale.FIT,
      autoCenter: Phaser.Scale.CENTER_BOTH,
      width: 384,
      height: 384,
    },
    scene: [],
  };
  const game = new Phaser.Game(config);
  game.scene.add("Game", GameScene, true, { room, characterIcons });
}

async function join(): Promise<void> {
  if (!selectedCharacter) {
    statusEl.textContent = "请先选择角色（公主或勇士）";
    return;
  }
  const name = nameInput.value.trim() || "勇者";
  joinBtn.disabled = true;
  statusEl.textContent = "连接中...";

  try {
    const [room, characterIcons] = await withTimeout(
      Promise.all([joinTowerRoom(name, selectedCharacter), rasterizeCharacterIcons()]),
      10000,
    );
    startGame(room, characterIcons);
  } catch (err) {
    console.error(err);
    const detail = err instanceof Error ? err.message : String(err);
    statusEl.textContent = `连接失败: ${detail}`;
    joinBtn.disabled = false;
  }
}

joinBtn.addEventListener("click", () => void join());
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") void join();
});

// If the OS fully reloaded the page while backgrounded (not just suspended the socket),
// silently rejoin the previous session instead of forcing the player back to the lobby.
(async () => {
  if (!loadReconnectionToken()) return;
  statusEl.textContent = "正在恢复上次的连接...";
  try {
    const [room, characterIcons] = await withTimeout(
      Promise.all([reconnectTowerRoom(), rasterizeCharacterIcons()]),
      8000,
    );
    startGame(room, characterIcons);
  } catch (err) {
    console.warn("auto-reconnect on load failed, falling back to lobby", err);
    clearReconnectionToken();
    statusEl.textContent = "";
  }
})();
