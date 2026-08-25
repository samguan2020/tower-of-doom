import type { CombatantStats, CombatResult } from "./types.js";

/**
 * Classic Tower-of-Doom (魔塔) contact combat: the monster attacks first each
 * round, the player attacks back, repeat until the monster's HP reaches 0.
 * The monster still lands its hit in the final round before it dies, so total
 * damage taken scales with `turns`, not `turns - 1`.
 */
export function resolveCombat(player: CombatantStats, monster: CombatantStats): CombatResult {
  const dmgToMonster = player.atk - monster.def;

  if (dmgToMonster <= 0) {
    return { winnable: false, playerDamageTaken: Infinity, turns: Infinity };
  }

  const turns = Math.ceil(monster.hp / dmgToMonster);
  const dmgPerHitToPlayer = Math.max(monster.atk - player.def, 0);
  const playerDamageTaken = dmgPerHitToPlayer * turns;
  const winnable = playerDamageTaken < player.hp;

  return { winnable, playerDamageTaken, turns };
}
