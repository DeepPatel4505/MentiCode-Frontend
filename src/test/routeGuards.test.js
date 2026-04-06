import { describe, it, expect } from "vitest";
import * as fc from "fast-check";

// ── Route guard logic (pure functions mirroring guard components) ──

function guestRoute(isAuth) {
  // GuestRoute: redirect to /dashboard if authenticated
  return isAuth ? "/dashboard" : "render_children";
}

function privateRoute(isAuth) {
  // PrivateRoute: redirect to /login if not authenticated
  return isAuth ? "render_children" : "/login";
}

function adminRoute(isAuth, isAdmin) {
  if (!isAuth)  return "/login";
  if (!isAdmin) return "/";
  return "render_children";
}

function onboardRoute(onboardingCompleted) {
  return onboardingCompleted ? "render_children" : "/onboarding";
}

// ── Property 1: PrivateRoute redirects when isAuth === false ──
describe("P1 — PrivateRoute redirects unauthenticated users", () => {
  it("always redirects to /login when isAuth is false", () => {
    fc.assert(
      fc.property(fc.boolean(), (isAuth) => {
        const result = privateRoute(isAuth);
        if (!isAuth) return result === "/login";
        return result === "render_children";
      })
    );
  });
});

// ── Property 2: AdminRoute redirects non-admin authenticated users ─
describe("P2 — AdminRoute redirects non-admin authenticated users", () => {
  it("redirects to / when authenticated but not admin", () => {
    fc.assert(
      fc.property(fc.boolean(), fc.boolean(), (isAuth, isAdmin) => {
        const result = adminRoute(isAuth, isAdmin);
        if (!isAuth)           return result === "/login";
        if (!isAdmin)          return result === "/";
        return result === "render_children";
      })
    );
  });
});

// ── Property 3: GuestRoute redirects authenticated users ─────
describe("P3 — GuestRoute redirects authenticated users to /dashboard", () => {
  it("always redirects to /dashboard when isAuth is true", () => {
    fc.assert(
      fc.property(fc.boolean(), (isAuth) => {
        const result = guestRoute(isAuth);
        if (isAuth) return result === "/dashboard";
        return result === "render_children";
      })
    );
  });
});

// ── Property 4: OnboardRoute redirects when onboarding incomplete ─
describe("P4 — OnboardRoute redirects when onboarding.completed is false", () => {
  it("always redirects to /onboarding when not completed", () => {
    fc.assert(
      fc.property(fc.boolean(), (completed) => {
        const result = onboardRoute(completed);
        if (!completed) return result === "/onboarding";
        return result === "render_children";
      })
    );
  });
});
