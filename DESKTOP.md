# Desktop-first layout contract

The app is called **BusFinder**. It was built mobile-only: 40 of 45 components
have no breakpoint at all and everything is clamped to `max-w-2xl` (672 px), so on
a large screen it is a narrow strip with desert on both sides.

The brief has now inverted. **Desktop is the primary design target.** Mobile stays
first-class, because the plan is to ship it wrapped as an Android app, so nothing
about the phone experience may regress. Two configurations, both deliberate, with
the centre of gravity on the large screen.

This file is the shared contract. Several agents work in parallel against it.

## Breakpoints

Tailwind defaults, used as follows:

| Range | Name | Shape |
|---|---|---|
| `< 768` | phone | today's layout: single column, bottom nav, drawer sidebar |
| `768–1023` (`md`) | tablet | wider single column, still bottom nav |
| `≥ 1024` (`lg`) | desktop | persistent sidebar + content, two-column pages |
| `≥ 1536` (`2xl`) | wide | same shape, more breathing room, wider map column |

The sidebar becomes furniture at `lg`. That threshold already exists in
`Sidebar.tsx` (`SIDEBAR_QUERY`); do not introduce a second, different one.

## Shared tokens (decided, not negotiable)

The shell agent defines these in `globals.css`; everyone else consumes them and
never hardcodes the values.

As implemented in `globals.css`:

| Token | `<lg` | `lg` | `2xl` | Meaning |
|---|---|---|---|---|
| `--shell-header-h` | `3.5rem` | `0rem` | | top bar height |
| `--shell-sidebar-w` | `0rem` | `18rem` | | sidebar lane |
| `--shell-pad-x` | `1rem` | `1.5rem` | | horizontal page gutter |
| `--shell-pad-y` | `1.25rem` | `0rem` | | vertical padding the shell applies |
| `--map-col-h` | — | `calc(100dvh - var(--shell-header-h) - 2 * var(--shell-pad-y))` | | **sticky map column height** |
| `--measure` | `70ch` | | | reading measure for prose pages |
| `--map-h` / `--map-h-min` | `42vh` / `14rem` | — | | stacked map height below `lg` |
| `--list-col-w` | `22rem` | | `24rem` | list column beside a map |
| `--arrivals-col-w` | `26rem` | | `30rem` | arrivals column on `/stop` |
| `--row-py` | `0.75rem` | `0.5625rem` | | list row padding, tighter at `lg` |
| `--section-gap` | `2rem` | `1.75rem` | | gap between page sections |

`--header-h` exists as an alias of `--shell-header-h`. Prefer the `--shell-`
spelling in new code.

Three things to note:

1. **The top bar disappears at `lg`.** The sidebar carries the brand, the search
   and the navigation, so a second horizontal bar is redundant. `--shell-header-h`
   collapses to `0rem` there, so a full-height column needs no special case.
2. **At `lg` the shell applies no vertical padding** (`--shell-pad-y` is `0`) and
   each page owns its spacing. Map pages must reach the viewport edge to be full
   height; reading pages want air. One shell value cannot serve both.
3. **Use `--map-col-h` for sticky map columns, do not roll your own.** It already
   accounts for the header and the shell padding, so it stays correct if either
   changes.

`.px-gutter` reads `--shell-pad-x` and clamps it to the safe-area inset, which is
what keeps the phone layout correct inside an Android WebView.

## The shell

`src/app/layout.tsx` currently wraps everything in `max-w-2xl`. That must go.
Replace it with a shell that at `lg` puts the sidebar in a fixed column and gives
the rest to the page:

- sidebar column: `18rem` (288 px), fixed, independently scrollable
- content column: fills the remainder, with its own max width **decided per page**,
  not globally

Pages declare their own width. Three families:

1. **Reading pages** (`/info`, `/alerts`, `/settings`): cap the measure around
   `70ch`. Long prose gets worse when you stretch it, not better.
2. **List pages** (`/`): a responsive grid, not a stretched column.
3. **Map pages** (`/stop/[id]`, `/nearby`, `/line/[id]`): full width, two columns.

## Two-column map pages

At `lg` and up:

- `/nearby`: stop list on the left (`22rem`), map on the right filling the rest,
  full viewport height minus the header, sticky. List scrolls, map does not move.
- `/line/[id]`: same shape, stop sequence left, path and live vehicles right.
- `/stop/[id]`: arrivals left (`26rem`–`30rem`, they are the point of the page),
  map right. On desktop the map is **always visible**, never behind a toggle: the
  collapse control is a phone affordance and should not appear at `lg`.

Below `lg` all three keep exactly today's stacked behaviour.

Maps must size themselves from their container, and MapLibre needs an explicit
resize when the column geometry changes; `MapView` already has a `ResizeObserver`,
so make sure the container actually changes size rather than the canvas being
clipped.

## The home grid

Favourites are the reason the app exists. At `lg` lay them out as
`repeat(auto-fill, minmax(20rem, 1fr))` so six are visible without scrolling, and
let each card show more arrivals than it does on the phone, since there is room.
Recents go beside them, not below, at `2xl`.

## Density

Desktop is not "the phone, bigger". Tighten it:

- body text stays at the same size; do not scale type up with the viewport
- reduce vertical padding between rows by roughly a quarter at `lg`
- show information that is hidden on mobile for space: full headsigns instead of
  truncated ones, the stop code next to the name, the delay in minutes as well as
  the coloured state
- hover states are a desktop-only affordance: add them, but never make anything
  reachable *only* by hover, because the same build runs on touch

## Non-negotiables

- **The phone layout must not regress.** Verify at 390×844 that every page is
  unchanged in structure and that tap targets stay at least 44 px.
- Exactly one `<main>` per page. The sidebar is `<nav>`, not a second main.
- No horizontal page scrollbar at any width from 320 px to 2560 px.
- Keyboard: focus order follows visual order in both configurations.
- Use the design tokens in `globals.css`. If you need a new token, add it there
  (shell agent owns that file) rather than hardcoding a value in a component.
- Everything stays in Italian.
