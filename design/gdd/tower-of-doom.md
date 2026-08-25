# 魔塔 · Tower of Doom (MVP)

## 1. Overview

A real-time co-op multiplayer reinterpretation of the classic Chinese "魔塔"
(Tower of Doom) puzzle-RPG. Players join a shared room and free-roam a
persistent 5-floor tower together: stationary monsters block tiles until
defeated by contact combat, colored keys open matching doors, and stat items
(potions, swords, shields) let players grow strong enough to reach the top
floor and defeat the boss guarding the exit. All world state (which monsters
are alive, which items remain, which doors are open) is shared and
server-authoritative — killing a monster or grabbing an item removes it for
every player in the room.

## 2. Player Fantasy

"I climb into a mysterious tower with friends, and every fight, every locked
door, every found sword is a real decision under real risk — the tower
remembers what my friends and I did to it." The fantasy is cooperative
resource management under scarcity (there's only one sword, one key on a
floor) layered on the classic 魔塔 satisfaction of a fight you can solve with
math before you commit to it.

## 3. Detailed Rules

- Movement is 4-directional, one grid tile per input, throttled client-side
  to one move per `MOVE_COOLDOWN_MS` (150ms) to keep network traffic sane.
- Each floor is an 8x8 grid of tiles: wall, floor, stair-up, stair-down, or a
  colored locked door (yellow/blue/red).
- Monsters are stationary and occupy exactly one tile, blocking it until
  killed. Moving into a monster's tile triggers automatic contact combat
  (see Formulas). If the fight is unwinnable, the server **refuses the move**
  and returns an `unwinnable` warning instead of letting the player die —
  this MVP intentionally has no death/respawn system (see Edge Cases).
- Items are stationary and occupy one tile. Moving onto an item's tile picks
  it up immediately and permanently removes it from the shared floor state.
  Item types: `potion_small`/`potion_big` (heal HP), `sword` (permanent ATK
  gain), `shield` (permanent DEF gain), `key_yellow`/`key_blue`/`key_red`
  (one use each).
- A locked door tile is impassable until the player holds at least one key
  of the matching color. Stepping onto it consumes one key and permanently
  opens the door for everyone in the room (it becomes passable floor).
- Stepping onto a stair-up tile moves the player to the next floor, landing
  at that floor's `spawnFromBelow` position. Stepping onto a stair-down tile
  does the reverse via `spawnFromAbove`. Floors persist their state (dead
  monsters stay dead, opened doors stay open) for the lifetime of the room,
  independent of which floor any given player is currently standing on.
- Reaching the stair-up tile on the top floor (floor 5) — which is only
  reachable by defeating the boss blocking it — sets that player's
  `victorious` flag and ends their climb.
- Players only see and interact with other players who share their current
  floor.

## 4. Formulas

**Contact combat** (`shared/src/combat.ts`, unit-tested in
`shared/src/combat.test.ts`): the monster attacks first each round, the
player attacks back, repeating until the monster's HP reaches 0. The monster
still lands its hit in the round it dies.

```
dmgToMonster = player.atk - monster.def
if dmgToMonster <= 0: fight is unwinnable (player can never damage the monster)

turns = ceil(monster.hp / dmgToMonster)
dmgPerHitToPlayer = max(monster.atk - player.def, 0)
playerDamageTaken = dmgPerHitToPlayer * turns

winnable = playerDamageTaken < player.hp
```

**Starting stats** (`shared/src/constants.ts`):
`hp = maxHp = 100`, `atk = 10`, `def = 10`, `gold = 0`.

## 5. Edge Cases

- **Unwinnable fight**: the server blocks the move entirely rather than
  allowing player death. This is a deliberate MVP scope cut — there is no
  death/respawn/game-over flow. A future iteration could add a confirmation
  prompt ("fight anyway?") gated behind an explicit design decision, since
  permitting death changes the co-op stakes significantly.
  Dependencies: `resolveCombat` (already returns enough data to support a
  "confirm anyway" flow later without a formula change).
- **Two players reach the same item/monster tile simultaneously**: the
  server processes `move` messages in receipt order per room (Colyseus rooms
  are single-threaded per room), so the first message wins and the second
  player's move is simply rejected by the normal collision rule for that
  now-vacated-or-still-occupied tile on the very next tick — no special
  casing needed.
- **Player disconnects mid-floor**: `onLeave` removes them from
  `state.players`; floor state (monsters/items/doors) is unaffected since it
  is keyed independently per floor, not per player.
- **All players leave the room**: Colyseus disposes the room and its state
  (including tower progress) by default. Persisting tower state across room
  restarts is out of MVP scope.

## 6. Dependencies

- `shared/src/floors/*` — the 5 floor definitions (terrain + starting
  monsters/items) this GDD describes.
- `shared/src/schema/TowerState.ts` — the Colyseus network state schema;
  any new player/monster/item field must be added here first.
- `server/src/gameLogic/applyMove.ts` — the single authoritative
  implementation of every rule in this document.

## 7. Tuning Knobs

- Per-floor monster `hp`/`atk`/`def`/`goldReward` (`shared/src/floors/*.ts`).
- Per-floor item `value` (heal amount / stat gain / key count).
- `STARTING_PLAYER_STATS` (`shared/src/constants.ts`).
- `MOVE_COOLDOWN_MS` (`client/src/scenes/GameScene.ts`) — network move rate.
- `maxReplicas` in `infra/main.bicep` — deliberately pinned to 1 (see
  Dependencies note in that file) until a shared state store is added.

## 8. Acceptance Criteria

- [ ] Two clients can join the same room and see each other move in
      real time while on the same floor.
- [ ] A monster killed by one player is gone (does not block movement, does
      not trigger combat again) for a second player who was not present for
      the kill.
- [ ] An item picked up by one player is unavailable to a second player.
- [ ] A locked door opened by one player stays open for all players, and
      consumes exactly one key of the matching color from the opener.
- [ ] `resolveCombat` unit tests pass (`npm test -w shared`).
- [ ] A player can walk from floor 1's entrance to floor 5's boss and,
      after defeating it, reach the victory tile — end to end, in one
      session, with default starting stats plus floor loot (validates the
      tower is solvable as tuned).
- [ ] The production Docker image serves both the built client and the
      WebSocket room on a single port and passes `GET /healthz`.
