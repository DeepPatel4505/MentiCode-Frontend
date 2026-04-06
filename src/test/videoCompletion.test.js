import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Video completion threshold ────────────────────────────────
const COMPLETION_THRESHOLD = 0.8;

function shouldComplete(currentTime, duration) {
  if (duration <= 0) return false;
  return currentTime / duration >= COMPLETION_THRESHOLD;
}

// ── Property 10: onComplete fires iff currentTime/duration >= 0.8 ─
describe("P10 — Video completion fires iff currentTime/duration >= 0.8", () => {
  it("holds for all valid (currentTime, duration) pairs", () => {
    fc.assert(
      fc.property(
        fc.float({ min: 0, max: Math.fround(10000), noNaN: true }),
        fc.float({ min: Math.fround(0.01), max: Math.fround(10000), noNaN: true }),
        (currentTime, duration) => {
          const result   = shouldComplete(currentTime, duration);
          const expected = currentTime / duration >= COMPLETION_THRESHOLD;
          return result === expected;
        }
      )
    );
  });
});
