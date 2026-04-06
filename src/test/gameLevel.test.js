import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Lives system ──────────────────────────────────────────────
const MAX_LIVES = 3;

function simulateLives(answers) {
  let lives = MAX_LIVES;
  for (const correct of answers) {
    if (!correct) lives = Math.max(0, lives - 1);
  }
  return lives;
}

// ── Score calculation ─────────────────────────────────────────
function calculateScore(answers) {
  if (!answers.length) return 0;
  const correct = answers.filter(Boolean).length;
  return Math.round((correct / answers.length) * 100);
}

// ── Property 8: Lives never go below 0 ───────────────────────
describe("P8 — Lives never go below 0", () => {
  it("holds for any sequence of answers", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 50 }), (answers) => {
        return simulateLives(answers) >= 0;
      })
    );
  });
});

// ── Property 9: Score is always in [0, 100] ──────────────────
describe("P9 — Score is always in [0, 100]", () => {
  it("holds for any non-empty answer array", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { minLength: 1, maxLength: 50 }), (answers) => {
        const score = calculateScore(answers);
        return score >= 0 && score <= 100;
      })
    );
  });
});
