# Styling Standards and Patterns

## Purpose
This document describes the current styling system in this frontend codebase: what tools are used, which patterns are followed, and what conventions are already established in practice.

## Styling Stack

### Core technologies
- React component rendering
- CSS files imported per feature/layout
- Tailwind CSS v4 through Vite plugin integration
- Vite build pipeline

### Tailwind integration (current setup)
- Tailwind is enabled with `@tailwindcss/vite` in `vite.config.js`.
- Global Tailwind entrypoint is `@import "tailwindcss";` in `src/index.css`.
- No legacy `@tailwind base/components/utilities` directives are used.
- PostCSS config is currently empty (`plugins: {}`), and Tailwind processing is handled via the Vite plugin path.
- No active `tailwind.config.*` file is required in this setup; default Tailwind v4 behavior is currently used.

## Style File Map and Responsibility

### Global base and framework entry
- `src/index.css`
- Responsibilities:
  - Tailwind import
  - global box sizing
  - root height/width setup for `html`, `body`, `#root`
  - default body typography and dark page background

### App-level legacy stylesheet
- `src/App.css`
- Contains nested selectors and demo-style sections (`.counter`, `.hero`, `#next-steps`, `.ticks`).
- It is imported in `src/App.jsx`, but selectors appear to be legacy/demo-oriented and not referenced by active product components.

### Global shell and navigation layout
- `src/layouts/GlobalLayout.css`
- Responsibilities:
  - overall app shell grid
  - top navbar styling
  - sidebar styling and resize handle states
  - shared sidebar link styling
  - responsive behavior for shell and nav
  - local design tokens via CSS custom properties

### Analyze feature visual system
- `src/features/analyze/analyze.css`
- Responsibilities:
  - dashboard cards and repository list
  - skeleton loaders and scrollbars
  - analyze playground/editor/findings UI
  - profile and job result screens
  - feature-level responsive adjustments

### Utility-first Tailwind test page
- `src/features/analyze/pages/TestTailwindCss.jsx`
- Uses inline Tailwind utility classes directly in JSX as a live style test surface.

## Import and Scope Pattern
Current CSS import pattern is component-entry scoped (not CSS modules):
- `src/main.jsx` imports `src/index.css`
- `src/App.jsx` imports `src/App.css`
- `src/layouts/GlobalLayout.jsx` imports `src/layouts/GlobalLayout.css`
- Analyze pages/sidebar import `src/features/analyze/analyze.css`

This means class names are globally scoped at runtime, so naming discipline is required to avoid collisions.

## Naming Convention in Use

### Primary convention: BEM-like class naming
The project mostly uses a BEM-style naming convention:
- Block: `.global-layout`, `.feature-sidebar`, `.repo-card`, `.analyze-home`
- Element: `.global-layout__main`, `.repo-card__title`, `.analyze-home__actions`
- Modifier: `.global-layout--sidebar-hidden`, `.repo-card--expanded`, `.top-navbar__tab--active`

### State conventions
State toggles are expressed as modifier classes or pseudo-classes:
- Modifiers for persistent state (`--active`, `--expanded`, `--hidden`)
- Pseudo-classes for interaction (`:hover`, `:focus-visible`, `:disabled`)

### Additional patterns
- Some IDs are used in `App.css` (legacy/demo pattern): `#center`, `#next-steps`, `#docs`
- Utility-class naming appears only in Tailwind-driven JSX route.

## Design Token Strategy

### Local token usage
`GlobalLayout.css` defines local custom properties on `.global-layout-shell`, for example:
- `--bg-page`, `--bg-navbar`, `--bg-sidebar`, `--bg-content`
- `--border`, `--text-main`, `--text-muted`, `--active`

These are used throughout shell/nav/sidebar styles and provide a clear local token model.

### Token scope standard currently followed
- Tokens are currently local to layout shell, not centralized globally in `:root`.
- Feature styles (`analyze.css`) mostly use direct color literals, not shared custom properties.

## Typography Standards (Current)

### Fonts in use
- Base body font (global): `Inter`, fallback sans stack (`src/index.css`)
- Shell font: `Manrope` via Google Fonts import (`GlobalLayout.css`)
- Feature heading font: `Space Grotesk` (`analyze.css`)
- Code/editor font: `JetBrains Mono`, `Consolas` (`analyze.css`)

### Text styling patterns
- Eyebrow labels are uppercase with increased tracking.
- Heading sections frequently use slight negative letter-spacing for dense display type.
- Content text uses muted blue/gray shades against dark surfaces.

## Color and Theme Standards (Current)

### Theme direction
- Dark-first visual system across core app surfaces.
- High-contrast text over dark neutral and blue-gray backgrounds.

### Color pattern
- Layout/nav heavily neutral dark palette with warm accent (`--active` ~ amber/orange).
- Analyze feature uses cool blue-gray surfaces and border tones.
- Accent actions use amber/orange and pale cyan depending on context.
- Tailwind test page introduces cyan/sky gradients and utility-driven colors.

### Standard currently followed
- Surface layering is consistent (page -> container -> card -> interactive control).
- Borders are heavily used to separate sections on dark backgrounds.

## Layout Standards (Current)

### Core layout primitives
- CSS Grid for shell-level structure:
  - top row navbar + main content row
  - sidebar/main split with resizable sidebar width
- Flexbox for local alignment:
  - navbar groups
  - form controls and card internals
  - action rows

### Width and sizing conventions
- Frequent use of fixed heights for controls and cards.
- Container max widths in feature pages for readability.
- Dynamic width variable for sidebar (`--sidebar-width`) controlled by React state.

## Responsiveness Standards (Current)

### Breakpoints in use
- `max-width: 1120px` in analyze feature
- `max-width: 1080px` and `max-width: 860px` in global layout
- `max-width: 1024px` in legacy App stylesheet
- Tailwind page uses responsive utility prefixes (`sm:`, `lg:`)

### Responsive behavior patterns
- Multi-column grids collapse to single-column on narrower screens.
- Sidebar behavior shifts to stacked layout on small screens.
- Search/input controls become full-width when space is constrained.
- Some typography uses `clamp()` for fluid heading sizes.

## Interaction and Motion Standards (Current)

### Interaction feedback
- Hover states: background, border, and subtle transform effects.
- Focus states: explicit `:focus-visible` outlines used in key controls.
- Disabled states: opacity and cursor changes.

### Motion behavior
- Short transitions are used for hover and expand/collapse interactions.
- Expand panels use animated grid-row and opacity transitions.
- Skeleton loading shimmer animation exists (`@keyframes repoSkeleton`).

### Standard currently followed
- Motion is subtle and functional, not decorative-heavy.
- Micro-interactions support affordance without large movement.

## Accessibility-Related Styling Standards (Current)

### What is followed
- Keyboard-visible outlines are implemented on major interactive elements.
- Text contrast is generally strong due to dark theme and light foreground text.
- Hit targets are reasonably sized for primary controls.

### What is not yet standardized
- No global reduced-motion media-query strategy is defined.
- No shared accessibility token scale for focus ring colors/thickness.

## Tailwind Usage Pattern (Current)

### Current approach
- Tailwind is enabled globally in build pipeline.
- Utility classes are actively demonstrated in `/testtailwindcss` route.
- Existing app UI outside this route still primarily uses handcrafted CSS classes.

### Utility standards demonstrated
- Layout utilities (`grid`, `flex`, spacing, max width)
- Typography utilities (size, weight, tracking)
- Effects (blur, shadows, opacity)
- Responsive utilities (`sm`, `lg` prefixes)
- Interactive utilities (`hover`, `focus`, transitions)
- Arbitrary values for custom gradient background

## Standards Already Followed Consistently
- BEM-like naming in most production CSS
- Dark-theme-first styling
- Local component/layout stylesheet ownership
- Clear state modifiers for active/expanded/hidden states
- Responsive behavior at shell and feature levels
- Focus-visible styling on key controls
- Utility-first Tailwind route for style-system verification

## Gaps and Inconsistencies in Current Styling
- Multiple font families across global/layout/feature areas without a single source-of-truth token file.
- Color tokens centralized only in layout shell; feature CSS still uses many hardcoded color literals.
- `src/App.css` appears legacy and not aligned with current product styles.
- Mixed styling paradigms (BEM class CSS plus Tailwind utilities) without a written migration policy.
- Breakpoint values vary by file, not yet standardized into one shared set.

## Practical Styling Standards for New Code (Based on Existing Patterns)
When adding new styles, follow these project-consistent rules:
- Prefer BEM-style class naming for handcrafted CSS.
- Keep feature-specific styles in feature-owned CSS files.
- Use modifier classes for UI state (`--active`, `--expanded`, `--hidden`).
- Preserve dark-surface hierarchy and border-based separation.
- Provide hover + focus-visible styles for interactive controls.
- Add responsive rules for at least one mobile breakpoint.
- If using Tailwind in new pages, keep utility composition readable and grouped by concern.

## Summary
This codebase currently follows a hybrid styling model:
- Primary production UI: handcrafted global CSS using BEM-like classes and dark-theme conventions.
- Tailwind: integrated and verified, currently used as a utility-first pattern on a dedicated route.

The existing standards are strong around naming, state handling, and shell responsiveness. The biggest opportunities are centralizing tokens (especially colors/typography), unifying breakpoints, and formalizing a single approach for new feature styling.
