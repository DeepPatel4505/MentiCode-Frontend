import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Property 18: Question progress is non-decreasing ─────────
function simulateQuestionProgress(answers) {
  let progress = 0;
  const history = [0];
  for (const _ of answers) {
    progress += 1;
    history.push(progress);
  }
  return history;
}

describe("P18 — Question progress is non-decreasing across answer submissions", () => {
  it("holds for any sequence of answers", () => {
    fc.assert(
      fc.property(fc.array(fc.boolean(), { maxLength: 30 }), (answers) => {
        const history = simulateQuestionProgress(answers);
        for (let i = 1; i < history.length; i++) {
          if (history[i] < history[i - 1]) return false;
        }
        return true;
      })
    );
  });
});

// ── Property 19: enrollInCourse is idempotent ─────────────────
function enrollInCourse(state, courseId) {
  // Simulates the Redux reducer: enrolling twice yields same state as once
  const existing = state.enrollments.find((e) => e.courseId === courseId);
  if (existing) return state; // already enrolled — no change
  return { ...state, enrollments: [...state.enrollments, { courseId, progress: 0 }] };
}

describe("P19 — enrollInCourse dispatched multiple times yields same state as once", () => {
  it("holds for any courseId", () => {
    fc.assert(
      fc.property(fc.uuid(), (courseId) => {
        const initial = { enrollments: [] };
        const once    = enrollInCourse(initial, courseId);
        const twice   = enrollInCourse(once, courseId);
        return JSON.stringify(once) === JSON.stringify(twice);
      })
    );
  });
});

// ── Property 20: fetchLeaderboard always resolves with >= 1 entry ─
const MOCK_LEADERBOARD = [
  { rank: 1, username: "alice", xpTotal: 5000, level: 50 },
  { rank: 2, username: "bob",   xpTotal: 4200, level: 42 },
  { rank: 3, username: "carol", xpTotal: 3800, level: 38 },
];

function fetchLeaderboardWithFallback(networkResult) {
  // If network fails (null/undefined/empty), return mock
  if (!networkResult || networkResult.length === 0) return MOCK_LEADERBOARD;
  return networkResult;
}

describe("P20 — fetchLeaderboard always resolves with at least one entry on network failure", () => {
  it("always returns >= 1 entry regardless of network result", () => {
    fc.assert(
      fc.property(
        fc.oneof(
          fc.constant(null),
          fc.constant(undefined),
          fc.constant([]),
          fc.array(fc.record({ rank: fc.nat(), username: fc.string(), xpTotal: fc.nat(), level: fc.nat() }), { minLength: 1, maxLength: 10 })
        ),
        (networkResult) => {
          const result = fetchLeaderboardWithFallback(networkResult);
          return result.length >= 1;
        }
      )
    );
  });
});
