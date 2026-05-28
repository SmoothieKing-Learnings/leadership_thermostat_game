# Shift Survival

A mobile-first leadership simulation from the **SmoothieKing Learnings** team, designed for store managers. Players navigate 10 shifts of real workplace scenarios, choosing how to lead under pressure. The core insight we wanted to teach: a great manager doesn't just read the room — they set it.

**Live experience:** https://smoothieking-learnings.github.io/leadership_thermostat_game/

---

## About the Experience

The game is grounded in a single metaphor:

> A thermometer reads the temperature. A thermostat sets it.

Each shift, the team scans you. Walk in tense and the crew rises to match; show up checked-out and the team freezes. Stay steady and you give them confidence to win the shift.

Every scenario presents a moment with two options: one models steady leadership, the other tips the room toward **Meltdown** (stress, panic, anger) or **Deep Freeze** (apathy, disengagement, lack of care). You have **three lives**. Three bad moves and the thermostat breaks — the team quits, reviews tank, sales plummet.

---

## Player Experience

- **Welcome.** A 4-step intro (landing + 3 tutorial steps) or a direct **Start Shift** that skips the tutorial.
- **Game.** 10 shift cards drawn from a balanced 21-card deck, with an energy gauge (arc or bar view), an oscillating background tint, history stack, and three "lives" 🍓 🫐 🍌 in the footer.
- **Win / Lose.** Win surfaces a tiered score and confetti; Lose stays warm and supportive, with a strike breakdown but no score.

Keyboard shortcuts: `1` / `A` selects option A, `2` / `B` selects option B, `Enter` / `Space` confirms or acknowledges a revealed card.

---

## Design System

This project ships with the **SmoothieKing Learnings unified design system**, identical across every experience in the `sk-learning` repo. The tokens live in [`tailwind.config.js`](./tailwind.config.js).

### Color tokens

| Token | Hex | Usage |
| --- | --- | --- |
| `brand` | `#930018` | Primary actions, completed shifts, meltdown text |
| `brand-deep` | `#40000F` | Body copy, secondary text |
| `brand-bright` | `#E31F26` | Active shift segment, "you are here" |
| `bg-primary` | `#FFF9EF` | Cream base background |
| `bg-light` / `pink-light` | `#FFDEE5` | Win modal accent, demo pill backgrounds |
| `pink-mid` | `#FFADB0` | Warm pink tint at full meltdown |
| `bg-soft-blue` / `blue-light` | `#D6E0FF` | Deep freeze states, freeze labels |
| `blue-mid` | `#9BB4FF` | Cool blue tint at full freeze |
| `green-light` / `green-mid` | `#D0FCA1` / `#B7EB7F` | Energy / success accents |
| `accent-amber`, `accent-coral`, `accent-teal`, `accent-gold`, `accent-violet` | shared style palette | Reserved for cross-project consistency |

Background-color tinting between cream → warm pink → cool blue is computed in [`src/App.jsx`](./src/App.jsx) via `getEnergyBg(displayEnergy)`.

### Typography

| Token | Family | Usage |
| --- | --- | --- |
| `font-display` / `font-heading` | **Playfair Display**, Georgia, serif | Hero titles, card titles, modal headlines |
| `font-body` | **DM Sans**, system-ui, sans-serif | All body copy, buttons, labels |

Both families are loaded from Google Fonts in [`index.html`](./index.html) and declared as `--font-display` / `--font-body` CSS custom properties in [`src/index.css`](./src/index.css).

### Iframe / LMS workflow

Embed mode is shared across the system. The universal utility lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js) and offers:

- `?embed=1` — explicit embed mode.
- `?autostart=1` / `?skipIntro=1` — drops the player directly into the first shift.
- `?parentOrigin=<encoded>` — locks `postMessage` delivery to one host origin.
- A namespaced `postMessage` contract (`shiftSurvival:*`) for `ready`, `start`, `win`, `lose`, `restart`, `resize`, `wheel`.
- A bare `{ type: 'complete' }` fire on win or lose so a Rise 360 Code Block can mark the lesson complete.

Full embed snippets, sizing guidance, scroll-passthrough patterns, and Rise 360 gotchas live in [IFRAME_EMBED.md](./IFRAME_EMBED.md).

---

## Tech Stack

| Layer | Technology |
| --- | --- |
| Framework | React 18 + Vite 5 |
| Animation | Framer Motion 11 |
| Styling | Tailwind CSS 3 + CSS custom properties |
| Confetti | canvas-confetti |
| Fonts | Playfair Display (display), DM Sans (body) |
| Build target | Mobile browser (480px max-width, 100dvh) |

---

## Project Structure

```
src/
├── App.jsx                      # Root — screen routing, modal orchestration, energy-driven bg tint
├── main.jsx                     # React entry point
├── data/
│   └── cards.js                 # SHIFT_DECK (21 active choice cards) + earlier CARD_DECK kept for reference
├── hooks/
│   └── useGameState.js          # All game logic, state machine, scoring, strike tracking
├── utils/
│   ├── iframeBridge.js          # Universal LMS embed contract (postMessage + hook)
│   └── useViewport.js           # Short-viewport detection
└── components/
    ├── WelcomeScreen.jsx         # 4-step intro flow shell
    ├── GameScreen.jsx            # Active gameplay layout
    ├── intro/                    # 4 tutorial steps + demo feedback modal
    ├── cards/                    # CardShell, ChoiceCard, EnvironmentCard
    ├── gauge/                    # GaugeArc (SVG semicircle) + GaugeBar (horizontal segments)
    ├── history/                  # HistoryStack — collapsed fan + full-screen carousel
    ├── modals/                   # WinModal, LoseModal
    └── ui/                       # ActionFooter, Pill (+ a few unused legacy components)
```

---

## Game State Machine

All game logic lives in [`src/hooks/useGameState.js`](./src/hooks/useGameState.js). State is managed with `useState` / `useCallback` — no external state libraries.

### Screens

```
welcome  →  game  →  win
                 ↘  lose
```

- **welcome**: 4-step intro (landing + 3-step tutorial)
- **game**: Active play (10 shifts)
- **win**: Player reached the end of shift 10 with fewer than 3 strikes
- **lose**: Player accumulated 3 strikes (energy ±5 does not end the game)

### Card phases (within `game`)

```
reading  →  revealed  →  animating  →  (next card / reading)
```

| Phase | Description |
| --- | --- |
| `reading` | Card is visible and interactive |
| `revealed` | Choice card has flipped; feedback + impact pill are showing |
| `animating` | Locked — gauge animating, card exiting (650ms) |

---

## The Strike System

Every choice option carries an `outcome` of `"success"`, `"meltdown"`, or `"freeze"`.

- **Success** options pull energy back toward 0 and cost no lives.
- **Meltdown** options push energy `+1` and cost one life (a strike).
- **Freeze** options push energy `-1` and cost one life (a strike).

You start with 3 lives, visualized as 🍓 🫐 🍌 in the footer. On a strike, the rightmost surviving fruit dims to grayscale. Three strikes ends the game.

The energy gauge is a **visual feedback signal only** — it can pin at ±5 without triggering a loss. It drives subtle background-color tinting (cool blue toward freeze, warm pink toward meltdown).

---

## Scoring System

Scoring math is computed in `calcChoicePoints()` inside `useGameState.js`.

### Base points (0–2 per choice)

| Outcome | Points |
| --- | --- |
| Chosen option moved energy closer to 0 than the alternative | 2 |
| Both options were equally close to 0 (tie) | 1 |
| Chosen option moved energy further from 0 | 0 |

### Timing bonus

| Decision time | Bonus |
| --- | --- |
| Under 6 seconds | +1 |
| 6 seconds or more | +0 |

### Final score

```
score % = (total points earned ÷ total base points possible) × 100
```

`total base points possible = choice card count × 2`. The timing bonus is earned on top, so fast accurate decisions can push the score above 100%. **On a loss, the score is not shown** — the lose modal stays purely supportive and strike-focused.

### Score tiers (win modal)

| Score | Tier |
| --- | --- |
| 90–100+ | Steady hand. You set the temperature. |
| 70–89 | You kept the thermostat humming. |
| 50–69 | Solid shifts. Keep blending. |
| 0–49 | Every shift teaches you the dial. |

---

## Intro Flow

The intro is a 4-step sequence managed by [`src/components/WelcomeScreen.jsx`](./src/components/WelcomeScreen.jsx). Steps 0 and 2 are "self-navigating" — they manage their own CTAs inside the component.

| Step | Component | Description |
| --- | --- | --- |
| 0 | `LandingStep` | Brand logo, title ("Shift Survival"), value statement, **Tutorial** + **Start Shift** CTAs |
| 1 | `MetaphorStep` | Live oscillating gauge, outcome legend (Meltdown / Deep Freeze / Steady), "Why does this matter?" accordion |
| 2 | `ChoiceDemoStep` | Player makes a real choice on a demo card; `DemoFeedbackModal` shows outcome with "TUTORIAL" tag |
| 3 | `RulesStep` | "Survive 10 Shifts" goal + 3 numbered rules |

---

## Gauge

Two interchangeable views, **toggled by tapping the gauge itself** (no separate toggle button):

- **Arc** ([`GaugeArc.jsx`](./src/components/gauge/GaugeArc.jsx)): SVG semicircle with a tapered needle, color zones, tick marks, and animated needle rotation (800ms CSS transition).
- **Bar** ([`GaugeBar.jsx`](./src/components/gauge/GaugeBar.jsx)): Horizontal gradient bar with an overlay indicator that grows from center (700ms transition).

The gauge reads as a pure emotional indicator — no numeric value appears below it and no numeric tick labels appear on the bar. The "Disengaged Deepfreeze" / "Messy Meltdown" / "Lost" semantic labels remain.

**Default view**: `bar` on viewports shorter than 800px (more compact), `arc` otherwise. Decided once per `startGame()` / `restartGame()`.

### Shake warnings

Both views shake when energy moves off center: gentle at ±1 (warn), rapid at ±2 and beyond (danger). The shake is a tension cue rather than a danger warning, since the gauge itself does not end the game.

---

## Energy-Driven Background Tint

The whole screen chrome shares a CSS custom property `--bg-energy` that interpolates between:

- Cream `#FFF9EF` at energy 0
- Warm pink `#FF95A8` at energy +5
- Cool blue `#8FA8FF` at energy −5

Computed in [`src/App.jsx`](./src/App.jsx) via `getEnergyBg(displayEnergy)`. The transition uses `transition: background-color 4000ms ease-in-out 800ms` — an 800ms delay then a 4-second fade.

---

## Loss Copy

The lose modal opens with the headline **"Tough shifts."** followed by the strike breakdown (e.g. `2 Meltdowns · 1 Deep Freeze`) and a warm, supportive body:

> *Some stretches feel like that — and even the best managers have lived through one. Take a breath, reset your dial, and step back in. The next shift is yours.*

No score is shown on a loss. Strike severity is intentionally not weighted — every wrong call counts equally.

---

## Local Development

```bash
npm install
npm run dev
```

Runs at `http://localhost:5173`. The production build emits with **relative asset paths**, so the same `dist/` works under any base URL — root path, sub-path, CDN, or custom domain.

```bash
npm run build
npm run preview
```

If an absolute base path is required, set `VITE_BASE_PATH` at build time:

```bash
VITE_BASE_PATH=/leadership_thermostat_game/ npm run build
```

---

## Deployment

The public build is served from **GitHub Pages** at:

> `https://smoothieking-learnings.github.io/leadership_thermostat_game/`

Every push to `main` triggers [`.github/workflows/deploy.yml`](./.github/workflows/deploy.yml), which installs dependencies with `npm ci`, runs `npm run build` with `VITE_BASE_PATH` set to the repo sub-path, and publishes `dist/` via the official `actions/deploy-pages` action. No manual release step is required — merging to `main` is the release.

The same `dist/` artifact can also be uploaded into Articulate Rise or any other LMS that accepts embedded HTML packages; in that case, build locally without `VITE_BASE_PATH` so the asset paths stay relative.

---

Maintained by the **SmoothieKing Learnings** team.
