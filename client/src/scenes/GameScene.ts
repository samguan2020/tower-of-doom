import type { Room } from "colyseus.js";
import Phaser from "phaser";
import { CHARACTER_IDS, TileType, getFloor, type CharacterId, type FloorDef, type FloorState, type ServerEvent, type TowerState } from "@tower/shared";
import { clearReconnectionToken, onServerEvent, reconnectTowerRoom, watchState } from "../net/NetworkClient.js";
import { characterTextureKey } from "../render/characterArt.js";
import { describeItemEffect, ITEM_COLORS, ITEM_GLYPH, ITEM_NAME, TILE_COLORS } from "../render/tileColors.js";

const TILE = 48;
const MOVE_COOLDOWN_MS = 150;

type Direction = { dx: -1 | 0 | 1; dy: -1 | 0 | 1 };

export class GameScene extends Phaser.Scene {
  private room!: Room<TowerState>;
  private characterIcons!: Record<CharacterId, HTMLCanvasElement>;
  private tileLayer!: Phaser.GameObjects.Graphics;
  private renderedFloorId = -1;
  private monsterNodes = new Map<string, Phaser.GameObjects.Container>();
  private itemNodes = new Map<string, Phaser.GameObjects.Container>();
  private playerNodes = new Map<string, Phaser.GameObjects.Container>();
  private cursors!: Phaser.Types.Input.Keyboard.CursorKeys;
  private keyW!: Phaser.Input.Keyboard.Key;
  private keyA!: Phaser.Input.Keyboard.Key;
  private keyS!: Phaser.Input.Keyboard.Key;
  private keyD!: Phaser.Input.Keyboard.Key;
  private lastMoveAt = 0;
  private dirty = true;
  private touchDir?: Direction;
  private hudEl = document.getElementById("hud") as HTMLDivElement;
  private logEl = document.getElementById("log") as HTMLDivElement;
  private tooltip!: Phaser.GameObjects.Container;
  private tooltipText!: Phaser.GameObjects.Text;
  private tooltipBg!: Phaser.GameObjects.Rectangle;
  private tooltipHideAt = 0;
  private isConnected = true;
  private reconnecting = false;

  constructor() {
    super("Game");
  }

  init(data: { room: Room<TowerState>; characterIcons: Record<CharacterId, HTMLCanvasElement> }): void {
    this.room = data.room;
    this.characterIcons = data.characterIcons;
  }

  create(): void {
    for (const character of CHARACTER_IDS) {
      const key = characterTextureKey(character);
      if (!this.textures.exists(key)) {
        this.textures.addCanvas(key, this.characterIcons[character]);
      }
    }

    this.tileLayer = this.add.graphics();
    this.hudEl.textContent = "等待游戏数据同步...";

    this.tooltipText = this.add
      .text(0, 0, "", { fontSize: "13px", color: "#ffffff", align: "center" })
      .setOrigin(0.5);
    const pad = 8;
    this.tooltipBg = this.add
      .rectangle(0, 0, this.tooltipText.width + pad * 2, this.tooltipText.height + pad * 2, 0x14121a, 0.92)
      .setStrokeStyle(1, 0x8338ec);
    this.tooltip = this.add.container(0, 0, [this.tooltipBg, this.tooltipText]).setDepth(1000).setVisible(false);

    const keyboard = this.input.keyboard;
    if (keyboard) {
      this.cursors = keyboard.createCursorKeys();
      this.keyW = keyboard.addKey("W");
      this.keyA = keyboard.addKey("A");
      this.keyS = keyboard.addKey("S");
      this.keyD = keyboard.addKey("D");
    }

    this.bindRoom();
    this.setupDpad();
    document.addEventListener("visibilitychange", this.handleVisibilityChange);
    this.events.once("shutdown", () => {
      document.removeEventListener("visibilitychange", this.handleVisibilityChange);
    });

    setTimeout(() => {
      if (this.renderedFloorId === -1) {
        this.hudEl.textContent = "长时间未收到游戏状态数据，可能是网络不稳定，请尝试刷新页面或更换网络";
      }
    }, 6000);
  }

  /** (Re-)attaches all room event/state listeners. Called on initial join and after every reconnect. */
  private bindRoom(): void {
    this.room.onError((code, message) => {
      this.hudEl.textContent = `房间错误 (${code}): ${message ?? "未知"}`;
    });
    this.room.onLeave(() => {
      this.isConnected = false;
      void this.tryReconnect();
    });

    const $ = watchState(this.room);
    const state = this.room.state;

    $(state).players.onAdd((player) => {
      $(player).onChange(() => {
        this.dirty = true;
      });
      this.dirty = true;
    });
    $(state).players.onRemove(() => {
      this.dirty = true;
    });

    $(state).floors.onAdd((floor) => {
      $(floor).monsters.onAdd(() => {
        this.dirty = true;
      });
      $(floor).monsters.onRemove(() => {
        this.dirty = true;
      });
      $(floor).items.onAdd(() => {
        this.dirty = true;
      });
      $(floor).items.onRemove(() => {
        this.dirty = true;
      });
      $(floor).doorsOpen.onAdd(() => {
        this.dirty = true;
      });
      $(floor).onChange(() => {
        this.dirty = true;
      });
      this.dirty = true;
    });

    onServerEvent(this.room, (event) => this.handleEvent(event));
  }

  private handleVisibilityChange = (): void => {
    if (document.visibilityState === "visible" && !this.isConnected && !this.reconnecting) {
      void this.tryReconnect();
    }
  };

  /** Retries reconnectTowerRoom() with backoff for as long as the server's reconnection grace window allows. */
  private async tryReconnect(): Promise<void> {
    if (this.reconnecting) return;
    this.reconnecting = true;

    const maxAttempts = 10;
    for (let attempt = 0; attempt < maxAttempts; attempt++) {
      this.hudEl.textContent = "网络已断开，正在尝试重新连接...";
      try {
        const room = await reconnectTowerRoom();
        this.swapRoom(room);
        this.isConnected = true;
        this.reconnecting = false;
        this.hudEl.textContent = "已重新连接";
        return;
      } catch (err) {
        console.warn("reconnect attempt failed", err);
        const delay = Math.min(2000 * (attempt + 1), 20000);
        await new Promise((resolve) => setTimeout(resolve, delay));
      }
    }

    this.reconnecting = false;
    clearReconnectionToken();
    this.hudEl.textContent = "重新连接失败，请刷新页面重新加入";
  }

  /** Swaps in a freshly reconnected Room and forces a full re-render, since old node caches may be stale. */
  private swapRoom(room: Room<TowerState>): void {
    this.room = room;
    for (const node of this.monsterNodes.values()) node.destroy();
    for (const node of this.itemNodes.values()) node.destroy();
    for (const node of this.playerNodes.values()) node.destroy();
    this.monsterNodes.clear();
    this.itemNodes.clear();
    this.playerNodes.clear();
    this.renderedFloorId = -1;
    this.dirty = true;
    this.bindRoom();
  }

  private setupDpad(): void {
    const bind = (id: string, dir: Direction) => {
      const el = document.getElementById(id);
      if (!el) return;
      const start = (e: Event) => {
        e.preventDefault();
        this.touchDir = dir;
      };
      const end = (e: Event) => {
        e.preventDefault();
        if (this.touchDir === dir) this.touchDir = undefined;
      };
      el.addEventListener("pointerdown", start);
      el.addEventListener("pointerup", end);
      el.addEventListener("pointercancel", end);
      el.addEventListener("pointerleave", end);
    };
    bind("dpadUp", { dx: 0, dy: -1 });
    bind("dpadDown", { dx: 0, dy: 1 });
    bind("dpadLeft", { dx: -1, dy: 0 });
    bind("dpadRight", { dx: 1, dy: 0 });
  }

  update(time: number): void {
    this.handleInput(time);
    if (this.dirty) {
      this.dirty = false;
      this.render();
    }
    if (this.tooltip.visible && time > this.tooltipHideAt) {
      this.tooltip.setVisible(false);
    }
  }

  private showTooltip(worldX: number, worldY: number, text: string): void {
    this.tooltipText.setText(text);
    const pad = 8;
    this.tooltipBg.setSize(this.tooltipText.width + pad * 2, this.tooltipText.height + pad * 2);
    const canvasWidth = this.scale.width;
    const halfW = this.tooltipBg.width / 2;
    const x = Phaser.Math.Clamp(worldX, halfW + 2, canvasWidth - halfW - 2);
    const y = Math.max(worldY - 34, this.tooltipBg.height / 2 + 2);
    this.tooltip.setPosition(x, y);
    this.tooltip.setVisible(true);
    this.tooltipHideAt = this.time.now + 2500;
  }

  private handleInput(time: number): void {
    if (time - this.lastMoveAt < MOVE_COOLDOWN_MS) return;

    const dir = this.readDirection();
    if (!dir) return;

    this.lastMoveAt = time;
    this.room.send("move", dir);
  }

  private readDirection(): Direction | undefined {
    if (this.touchDir) return this.touchDir;
    if (!this.cursors) return undefined;
    if (this.cursors.left.isDown || this.keyA.isDown) return { dx: -1, dy: 0 };
    if (this.cursors.right.isDown || this.keyD.isDown) return { dx: 1, dy: 0 };
    if (this.cursors.up.isDown || this.keyW.isDown) return { dx: 0, dy: -1 };
    if (this.cursors.down.isDown || this.keyS.isDown) return { dx: 0, dy: 1 };
    return undefined;
  }

  private handleEvent(event: ServerEvent): void {
    let line = "";
    switch (event.type) {
      case "combat":
        line = `⚔️ 击败 ${event.monsterName}，损失 ${event.damageTaken} HP，获得 ${event.goldReward} 金币`;
        break;
      case "unwinnable":
        line = `⚠️ 打不过 ${event.monsterName}（会被打死，先去变强吧）`;
        break;
      case "itemPickup": {
        const name = ITEM_NAME[event.itemType] ?? event.itemType;
        const effect = describeItemEffect(event.itemType, event.value);
        line = `✨ 拾取了 ${name}${effect ? `，${effect}` : ""}`;
        break;
      }
      case "floorChange":
        line = `🪜 前往第 ${event.floorId} 层`;
        break;
      case "victory":
        line = `🎉 恭喜通关魔塔！`;
        break;
    }
    const p = document.createElement("div");
    p.textContent = line;
    this.logEl.prepend(p);
    while (this.logEl.childNodes.length > 20) {
      this.logEl.removeChild(this.logEl.lastChild as Node);
    }
  }

  private render(): void {
    if (!this.room.state?.players || !this.room.state.floors) return;
    const localPlayer = this.room.state.players.get(this.room.sessionId);
    if (!localPlayer) return;

    const floorId = localPlayer.floorId;
    const floorDef = getFloor(floorId);
    const floorRuntime = this.room.state.floors.get(String(floorId));

    if (floorId !== this.renderedFloorId) {
      this.renderedFloorId = floorId;
      for (const node of this.monsterNodes.values()) node.destroy();
      for (const node of this.itemNodes.values()) node.destroy();
      for (const node of this.playerNodes.values()) node.destroy();
      this.monsterNodes.clear();
      this.itemNodes.clear();
      this.playerNodes.clear();
    }

    this.drawTiles(floorDef, floorRuntime);

    const monsterIds = new Set<string>();
    if (floorRuntime) {
      for (const monster of floorRuntime.monsters.values()) {
        monsterIds.add(monster.id);
        let node = this.monsterNodes.get(monster.id);
        if (!node) {
          const tooltip = `${monster.name}\nHP ${monster.hp} 攻 ${monster.atk} 防 ${monster.def}`;
          node = this.createEntityNode(0x8b0000, monster.name.slice(0, 1), 16, false, tooltip);
          this.monsterNodes.set(monster.id, node);
        }
        node.setPosition(monster.x * TILE + TILE / 2, monster.y * TILE + TILE / 2);
      }
    }
    for (const [id, node] of this.monsterNodes) {
      if (!monsterIds.has(id)) {
        node.destroy();
        this.monsterNodes.delete(id);
      }
    }

    const itemIds = new Set<string>();
    if (floorRuntime) {
      for (const item of floorRuntime.items.values()) {
        itemIds.add(item.id);
        let node = this.itemNodes.get(item.id);
        if (!node) {
          const name = ITEM_NAME[item.itemType] ?? item.itemType;
          const effect = describeItemEffect(item.itemType, item.value);
          const tooltip = effect ? `${name}\n${effect}` : name;
          node = this.createEntityNode(
            ITEM_COLORS[item.itemType] ?? 0xffffff,
            ITEM_GLYPH[item.itemType] ?? "?",
            18,
            false,
            tooltip,
          );
          this.itemNodes.set(item.id, node);
        }
        node.setPosition(item.x * TILE + TILE / 2, item.y * TILE + TILE / 2);
      }
    }
    for (const [id, node] of this.itemNodes) {
      if (!itemIds.has(id)) {
        node.destroy();
        this.itemNodes.delete(id);
      }
    }

    const presentPlayerIds = new Set<string>();
    this.room.state.players.forEach((player, sessionId) => {
      if (player.floorId !== floorId) return;
      presentPlayerIds.add(sessionId);
      let node = this.playerNodes.get(sessionId);
      const isLocal = sessionId === this.room.sessionId;
      if (!node) {
        node = this.createPlayerNode(player.character as CharacterId, player.color, isLocal);
        this.playerNodes.set(sessionId, node);
      }
      node.setPosition(player.x * TILE + TILE / 2, player.y * TILE + TILE / 2);
    });
    for (const [id, node] of this.playerNodes) {
      if (!presentPlayerIds.has(id)) {
        node.destroy();
        this.playerNodes.delete(id);
      }
    }

    this.updateHud(localPlayer);
  }

  private drawTiles(floorDef: FloorDef, floorRuntime: FloorState | undefined): void {
    this.tileLayer.clear();
    for (let y = 0; y < floorDef.height; y++) {
      for (let x = 0; x < floorDef.width; x++) {
        const tile = floorDef.tiles[y][x];
        const doorOpened = floorRuntime?.doorsOpen.get(`${x},${y}`);
        const gateOpened = tile === TileType.GATE && floorRuntime?.gateOpen;
        const color =
          doorOpened || gateOpened ? TILE_COLORS[TileType.FLOOR] : (TILE_COLORS[tile] ?? TILE_COLORS[TileType.FLOOR]);
        this.tileLayer.fillStyle(color, 1);
        this.tileLayer.fillRect(x * TILE + 1, y * TILE + 1, TILE - 2, TILE - 2);
      }
    }
  }

  private createEntityNode(
    color: number,
    label: string,
    radius = 16,
    highlight = false,
    tooltipText?: string,
  ): Phaser.GameObjects.Container {
    const circle = this.add.circle(0, 0, radius, color);
    if (highlight) {
      circle.setStrokeStyle(3, 0xffffff);
    }
    const text = this.add.text(0, 0, label, { fontSize: "16px", color: "#ffffff" }).setOrigin(0.5);
    const node = this.add.container(0, 0, [circle, text]);
    if (tooltipText) {
      circle.setInteractive({ useHandCursor: true });
      circle.on("pointerdown", () => this.showTooltip(node.x, node.y, tooltipText));
    }
    return node;
  }

  private createPlayerNode(character: CharacterId, color: number, highlight: boolean): Phaser.GameObjects.Container {
    const ring = this.add.circle(0, 0, 21, color, 0.2);
    ring.setStrokeStyle(highlight ? 3 : 2, highlight ? 0xffffff : color);
    const icon = this.add.image(0, 0, characterTextureKey(character)).setDisplaySize(34, 34);
    return this.add.container(0, 0, [ring, icon]);
  }

  private updateHud(player: { name: string; hp: number; maxHp: number; atk: number; def: number; gold: number; floorId: number; keysYellow: number; keysBlue: number; keysRed: number; victorious: boolean }): void {
    const keys: string[] = [];
    if (player.keysYellow > 0) keys.push(`黄钥匙x${player.keysYellow}`);
    if (player.keysBlue > 0) keys.push(`蓝钥匙x${player.keysBlue}`);
    if (player.keysRed > 0) keys.push(`红钥匙x${player.keysRed}`);

    this.hudEl.innerHTML = `
      <span>${player.name}${player.victorious ? " 👑" : ""}</span>
      <span>第 <b>${player.floorId}</b> 层</span>
      <span>HP <b>${player.hp}</b>/${player.maxHp}</span>
      <span>攻击 <b>${player.atk}</b></span>
      <span>防御 <b>${player.def}</b></span>
      <span>金币 <b>${player.gold}</b></span>
      <span>${keys.join(" ") || "无钥匙"}</span>
    `;
  }
}
