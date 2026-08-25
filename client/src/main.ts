import Phaser from "phaser";
import { joinTowerRoom } from "./net/NetworkClient.js";
import { GameScene } from "./scenes/GameScene.js";

const lobby = document.getElementById("lobby") as HTMLDivElement;
const app = document.getElementById("app") as HTMLDivElement;
const nameInput = document.getElementById("nameInput") as HTMLInputElement;
const joinBtn = document.getElementById("joinBtn") as HTMLButtonElement;
const statusEl = document.getElementById("status") as HTMLDivElement;

async function join(): Promise<void> {
  const name = nameInput.value.trim() || "勇者";
  joinBtn.disabled = true;
  statusEl.textContent = "连接中...";

  try {
    const room = await joinTowerRoom(name);
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
    statusEl.textContent = "连接失败，请确认服务器正在运行后重试";
    joinBtn.disabled = false;
  }
}

joinBtn.addEventListener("click", () => void join());
nameInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") void join();
});
