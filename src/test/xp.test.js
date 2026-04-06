import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Helpers (mirrors DashboardPage logic) ─────────────────────
const XP_PER_LEVEL = 100;

function getXpProgress(xpTotal = 0) {
  const level = Math.floor(xpTotal / XP_PER_LEVEL) + 1;
  const pct   = ((xpTotal % XP_PER_LEVEL) / XP_PER_LEVEL) * 100;
  return { level, pct: Math.min(100, Math.max(0, pct)) };
}

function getLevelFromXp(xpTotal = 0) {
  return Math.floor(xpTotal / XP_PER_LEVEL) + 1;
}

function addXp(current, gain) {
  const before = getLevelFromXp(current);
  const after  = getLevelFromXp(current + gain);
  return { newXp: current + gain, leveledUp: after > before };
}

// ── Property 5: pct is always in [0, 100] ────────────────────
describe("P5 — getXpProgress.pct ∈ [0, 100]", () => {
  it("holds for all non-negative integers", () => {
    fc.assert(
      fc.property(fc.nat(), (xpTotal) => {
        const { pct } = getXpProgress(xpTotal);
        return pct >= 0 && pct <= 100;
      })
    );
  });
});

// ── Property 6: getLevelFromXp is monotonically non-decreasing ─
describe("P6 — getLevelFromXp is monotonically non-decreasing", () => {
  it("holds for all pairs (a, b) where a <= b", () => {
    fc.assert(
      fc.property(
        fc.nat(10000),
        fc.nat(10000),
        (a, b) => {
          const lo = Math.min(a, b);
          const hi = Math.max(a, b);
          return getLevelFromXp(lo) <= getLevelFromXp(hi);
        }
      )
    );
  });
});

// ── Property 7: addXp triggers level-up when threshold crossed ─
describe("P7 — addXp triggers level-up when XP threshold is crossed", () => {
  it("leveledUp is true iff crossing a level boundary", () => {
    fc.assert(
      fc.property(
        fc.nat(10000),
        fc.nat(200),
        (current, gain) => {
          const { leveledUp, newXp } = addXp(current, gain);
          const expectedLevelUp = getLevelFromXp(newXp) > getLevelFromXp(current);
          return leveledUp === expectedLevelUp;
        }
      )
    );
  });
});
