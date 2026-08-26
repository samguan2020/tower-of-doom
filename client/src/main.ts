import Phaser from "phaser";
import { joinTowerRoom } from "./net/NetworkClient.js";
import { GameScene } from "./scenes/GameScene.js";

const lobby = document.getElementById("lobby") as HTMLDivElement;
const app = document.getElementById("app") as HTMLDivElement;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const joinBtn = document.getElementById("joinBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;
const errorBanner = document.getElementById("errorBanner") as HTMLDivElement;

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

async function join(): Promise<void> {
  const name = nameInput.value.trim() || "勇者";
  joinBtn.disabled = true;
  statusEl.textContent = "连接中...";

  try {
    const room = await withTimeout(joinTowerRoom(name), 10000);
    lobby.style.display = "none";
    app.style.display = "flex";

    const config: Phaser.Types.Core.GameConfig = {
      type: Phaser.AUTO,
      width: 384,
      height: 384,
      parent: "gameContainer",
      backgroundColor: "#14121a",
      scene: [],
    };
    const game = new Phaser.Game(config);
    game.scene.add("Game", GameScene, true, { room });
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
