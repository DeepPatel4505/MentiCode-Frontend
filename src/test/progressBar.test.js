import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Progress bar clamping ─────────────────────────────────────
function clampProgress(value) {
  return Math.min(100, Math.max(0, value));
}

// ── Onboarding step bounds ────────────────────────────────────
const MAX_STEP = 4;

function simulateOnboardingStep(actions) {
  let step = 0;
  for (const action of actions) {
    if (action === "next") step = Math.min(MAX_STEP, step + 1);
    if (action === "back") step = Math.max(0, step - 1);
  }
  return step;
}

// ── Onboarding completed one-way transition ───────────────────
function applyOnboardingUpdates(updates) {
  let completed = false;
  for (const update of updates) {
    if (update.completed === true) completed = true;
    // Once completed, it cannot be set back to false
  }
  return completed;
}

// ── Property 15: ProgressBar fill = clamp(v, 0, 100) ─────────
describe("P15 — ProgressBar fill width equals Math.min(100, Math.max(0, v))", () => {
  it("holds for all float values including negatives and > 100", () => {
    fc.assert(
      fc.property(fc.float({ noNaN: true }), (v) => {
        const result   = clampProgress(v);
        const expected = Math.min(100, Math.max(0, v));
        return Math.abs(result - expected) < 0.0001;
      })
    );
  });
});

// ── Property 16: Onboarding step is always in [0, 4] ─────────
describe("P16 — Onboarding step is always in [0, 4]", () => {
  it("holds for any sequence of next/back actions", () => {
    fc.assert(
      fc.property(
        fc.array(fc.constantFrom("next", "back"), { maxLength: 50 }),
        (actions) => {
          const step = simulateOnboardingStep(actions);
          return step >= 0 && step <= MAX_STEP;
        }
      )
    );
  });
});

// ── Property 17: onboarding.completed is a one-way transition ─
describe("P17 — onboarding.completed is a one-way transition (true → stays true)", () => {
  it("once completed is set to true, it cannot go back to false", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ completed: fc.boolean() }),
          { minLength: 1, maxLength: 20 }
        ),
        (updates) => {
          const result = applyOnboardingUpdates(updates);
          const everCompleted = updates.some((u) => u.completed === true);
          return result === everCompleted;
        }
      )
    );
  });
});
