import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Lock logic ────────────────────────────────────────────────
function isLocked(lessonOrder, freeUpToLesson, isPro) {
  if (isPro) return false;
  if (freeUpToLesson === null) return false;
  return lessonOrder > freeUpToLesson;
}

// ── Filter helpers ────────────────────────────────────────────
function filterByDifficulty(courses, difficulty) {
  if (!difficulty) return courses;
  return courses.filter((c) => c.difficulty === difficulty);
}

function filterByTitle(courses, query) {
  if (!query) return courses;
  return courses.filter((c) => c.title.toLowerCase().includes(query.toLowerCase()));
}

// ── Property 11: Lessons with order > freeUpToLesson are locked for free users ─
describe("P11 — Lesson lock logic for free users", () => {
  it("locks lessons beyond freeUpToLesson for non-pro users", () => {
    fc.assert(
      fc.property(
        fc.integer({ min: 1, max: 20 }),
        fc.integer({ min: 0, max: 20 }),
        fc.boolean(),
        (lessonOrder, freeUpToLesson, isPro) => {
          const locked = isLocked(lessonOrder, freeUpToLesson, isPro);
          if (isPro) return !locked;
          return locked === (lessonOrder > freeUpToLesson);
        }
      )
    );
  });
});

// ── Property 12: Difficulty filter returns only matching courses ─
describe("P12 — Difficulty filter returns only matching courses", () => {
  it("holds for any list of courses and any difficulty filter", () => {
    const difficulties = ["beginner", "intermediate", "advanced"];
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ title: fc.string(), difficulty: fc.constantFrom(...difficulties) }),
          { maxLength: 20 }
        ),
        fc.constantFrom("", ...difficulties),
        (courses, difficulty) => {
          const result = filterByDifficulty(courses, difficulty);
          return result.every((c) => !difficulty || c.difficulty === difficulty);
        }
      )
    );
  });
});

// ── Property 13: Title search returns only matching courses ──
describe("P13 — Title search returns only courses containing the query", () => {
  it("holds for any list of courses and any search query", () => {
    fc.assert(
      fc.property(
        fc.array(
          fc.record({ title: fc.string({ minLength: 1, maxLength: 50 }) }),
          { maxLength: 20 }
        ),
        fc.string({ maxLength: 10 }),
        (courses, query) => {
          const result = filterByTitle(courses, query);
          return result.every((c) =>
            !query || c.title.toLowerCase().includes(query.toLowerCase())
          );
        }
      )
    );
  });
});
