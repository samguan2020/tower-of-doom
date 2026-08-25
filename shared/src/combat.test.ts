import { describe, expect, it } from "vitest";
import { resolveCombat } from "./combat.js";

describe("resolveCombat", () => {
  it("kills a monster in one hit and takes one round of damage", () => {
    const result = resolveCombat({ hp: 100, atk: 20, def: 0 }, { hp: 10, atk: 5, def: 0 });
    expect(result.winnable).toBe(true);
    expect(result.turns).toBe(1);
    expect(result.playerDamageTaken).toBe(5);
  });

  it("computes multi-round damage correctly", () => {
    // player deals 20-5=15/hit, monster has 40 hp -> ceil(40/15) = 3 turns
    // monster deals 12-5=7/hit -> 7*3 = 21 damage taken
    const result = resolveCombat({ hp: 100, atk: 20, def: 5 }, { hp: 40, atk: 12, def: 5 });
    expect(result.turns).toBe(3);
    expect(result.playerDamageTaken).toBe(21);
    expect(result.winnable).toBe(true);
  });

  it("is unwinnable when the player cannot damage the monster", () => {
    const result = resolveCombat({ hp: 100, atk: 5, def: 5 }, { hp: 40, atk: 5, def: 10 });
    expect(result.winnable).toBe(false);
    expect(result.turns).toBe(Infinity);
  });

  it("is unwinnable when total damage taken would meet or exceed player hp", () => {
    // player deals 5/hit, monster has 10 hp -> 2 turns; monster deals 6/hit -> 12 damage >= 10 hp
    const result = resolveCombat({ hp: 10, atk: 10, def: 5 }, { hp: 10, atk: 11, def: 5 });
    expect(result.turns).toBe(2);
    expect(result.playerDamageTaken).toBe(12);
    expect(result.winnable).toBe(false);
  });

  it("deals zero damage to the player when defense fully absorbs the hit", () => {
    const result = resolveCombat({ hp: 10, atk: 10, def: 20 }, { hp: 10, atk: 5, def: 0 });
    expect(result.winnable).toBe(true);
    expect(result.playerDamageTaken).toBe(0);
  });
});
