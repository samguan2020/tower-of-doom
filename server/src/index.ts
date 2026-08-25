import { createServer } from "http";
import path from "path";
import { fileURLToPath } from "url";
import { WebSocketTransport } from "@colyseus/ws-transport";
import { ROOM_NAME } from "@tower/shared";
import { Server } from "@colyseus/core";
import cors from "cors";
import express from "express";
import { TowerRoom } from "./rooms/TowerRoom.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const port = Number(process.env.PORT) || 2567;

const app = express();
app.use(cors());

// Populated by the Docker build (client dist copied here) — see Dockerfile.
const publicDir = path.join(__dirname, "../public");
app.use(express.static(publicDir));

app.get("/healthz", (_req, res) => {
  res.status(200).send("ok");
});

app.get("*", (_req, res) => {
  res.sendFile(path.join(publicDir, "index.html"), (err) => {
    if (err) res.status(404).send("Not found — client build missing in this environment");
  });
});

const httpServer = createServer(app);

const gameServer = new Server({
  transport: new WebSocketTransport({ server: httpServer }),
});

gameServer.define(ROOM_NAME, TowerRoom);

httpServer.listen(port, () => {
  console.log(`Tower of Doom server listening on :${port}`);
});
