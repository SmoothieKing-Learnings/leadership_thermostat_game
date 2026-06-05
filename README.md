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

- **Welcome.** A 4-step intro (landing + 3 tutorial steps) or a direct **Start Shift** that skips the tutorial. The landing screen displays the title **"Setting the Thermostat"** and offers a **Learn more →** path into the tutorial alongside **Start Shift**.
- **Game.** 10 shift cards drawn from a balanced 21-card deck, with an energy gauge (arc or bar view), a background tint that shifts on every choice, a history stack, and three SmoothieKing heart icons in the footer representing lives.
- **Win.** Confetti, a "Shifts Survived" count-up (e.g. `10 / 10`), and a tier copy line ("Steady hand. You set the temperature." through "Every shift teaches you the dial."). The underlying score percent is computed but never displayed.
- **Lose.** A bottom-sheet modal headlined **"Tough shifts."** with a strike breakdown (e.g. `2 Meltdowns · 1 Deep Freeze`) and supportive copy. No score is shown.

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
| `pink-mid` | `#FFADB0` | Shared mid-pink token (the live background tint at full meltdown is the softer `#FFC7CB`, applied inline in `App.jsx`) |
| `bg-soft-blue` / `blue-light` | `#D6E0FF` | Deep freeze states, freeze labels |
| `blue-mid` | `#9BB4FF` | Shared mid-blue token (the live background tint at full freeze is the softer `#C7D0F7`, applied inline in `App.jsx`) |
| `green-light` / `green-mid` | `#D0FCA1` / `#B7EB7F` | Energy / success accents |
| `accent-amber`, `accent-coral`, `accent-teal`, `accent-gold`, `accent-violet` | shared style palette | Reserved for cross-project consistency |

Background-color tinting between cream → warm pink → cool blue is computed in [`src/App.jsx`](./src/App.jsx) via `getEnergyBg(displayEnergy)`.

### Typography

| Token | Family | Usage |
| --- | --- | --- |
| `font-display` / `font-heading` | **Lora**, Georgia, serif | Hero titles, card titles, modal headlines |
| `font-body` | **Poppins**, system-ui, sans-serif | All body copy, buttons, labels |

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
| Fonts | Lora (display), Poppins (body) |
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
│   └── useViewport.js           # `useShortViewport` (height threshold) + `useDocumentVisible` (pauses animations off-screen)
└── components/
    ├── WelcomeScreen.jsx         # 4-step intro flow shell
    ├── GameScreen.jsx            # Active gameplay layout (logo header, gauge, card stack, footer)
    ├── intro/                    # LandingStep, MetaphorStep, ChoiceDemoStep, RulesStep, DemoFeedbackModal
    │                             # (EnvDemoStep.jsx is checked in but not wired into the flow)
    ├── cards/                    # CardShell, ChoiceCard, EnvironmentCard (env cards aren't drawn in live play)
    ├── gauge/                    # GaugeArc (SVG semicircle) + GaugeBar (horizontal segments)
    ├── history/                  # HistoryStack — collapsed fan + full-screen "Leadership Log" carousel
    ├── modals/                   # WinModal, LoseModal
    └── ui/                       # ActionFooter, Pill
                                  # GaugeToggle.jsx and AutoplayButton.jsx live here but are not imported anywhere
```

Two top-level files inside `components/` — `ActionFooter.jsx` and `GaugeBar.jsx` — duplicate the names of the active versions under `components/ui/` and `components/gauge/`. They are not imported by any active code path and exist as historical artifacts.

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
- **win**: Player reached the end of shift 10 with fewer than 3 strikes (win modal renders as an overlay above the still-mounted GameScreen)
- **lose**: Player accumulated 3 strikes — the only loss condition. The pin's `±2.5` extremes do not end the game.

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

Every choice option carries an `outcome` of `"success"`, `"meltdown"`, or `"freeze"`. On confirm, the gauge pin **snaps** to one of three positions defined in `useGameState.js`:

```js
const PIN_BY_OUTCOME = { success: 0, meltdown: 2.5, freeze: -2.5 }
```

- **Success** snaps the pin to `0` (Balance) and costs no lives.
- **Meltdown** snaps the pin to `+2.5` and costs one life (a strike).
- **Freeze** snaps the pin to `-2.5` and costs one life (a strike).

Pin position does not accumulate between rounds — every choice resets it to one of those three values.

You start with 3 lives, drawn as three SmoothieKing heart icons (`SMOOTHIEKING_HEART.svg`) in the footer. On a strike, the rightmost surviving heart fades to ~25% opacity with a grayscale + brightness filter applied. Three strikes ends the game.

The energy gauge is a **visual feedback signal only** — the pin snapping never ends the game. The arc and bar are *drawn* with tick marks running from `-5` to `+5`, but the live pin only ever lives at `{-2.5, 0, +2.5}`. The pin position drives subtle background-color tinting (cool blue toward freeze, warm pink toward meltdown).

---

## Scoring System

Scoring math is computed in `calcChoicePoints()` inside [`src/hooks/useGameState.js`](./src/hooks/useGameState.js). The math runs every round, but **the numeric score is never surfaced in the UI**. It is used only to choose the tier copy in the win modal.

### Base points (per choice)

Scoring is binary and depends only on the chosen option's `outcome`:

| Outcome of chosen option | Base points |
| --- | --- |
| `success` | 2 |
| `meltdown` or `freeze` | 0 |

### Timing bonus

Awarded **only on success picks** that are confirmed in under 6 seconds.

| Decision time | Bonus (success picks only) |
| --- | --- |
| Under 6 seconds | +1 |
| 6 seconds or more | +0 |

A meltdown/freeze pick never earns the timing bonus, regardless of how fast it was made.

### Final score

```
score % = (total points earned ÷ total base points possible) × 100
```

`total base points possible = choice card count × 2`. Because the timing bonus is added on top of the base, a perfect run with every choice made under 6s can push the percent above 100%.

**Neither modal displays the score.** The win modal shows a "Shifts Survived" count-up (`N / 10`) and a tier copy line. The lose modal shows the strike breakdown and supportive copy.

### Score tiers (drives the win-modal copy)

The tier is selected from the silent score percent in `getTier(pct)` inside `WinModal.jsx`:

| Score % | Tier copy shown beneath the count-up |
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
| 0 | `LandingStep` | Brand logo, title (**"Setting the Thermostat"**), the thermometer-vs-thermostat value statement, and two CTAs: **Learn more →** (advances into the tutorial) and **Start Shift** (skips to the game). |
| 1 | `MetaphorStep` | A live oscillating arc gauge, the headline "You Are the Thermostat", explanatory copy, a three-card legend (Deep Freeze / Steady / Meltdown), and a "Why does this matter in real life?" accordion. |
| 2 | `ChoiceDemoStep` | Player makes a real choice on a demo card built around the "$80 Mistake" scenario; `DemoFeedbackModal` shows the outcome (Meltdown / Deep Freeze / Steady) and the educational message. |
| 3 | `RulesStep` | The "Survive 10 Shifts" goal block plus three numbered rules: **Face the Scenario**, **Watch the Thermostat** (with Meltdown / Deep Freeze sub-bullets), and **Three Strikes and Our Culture is Lost**. |

---

## Gauge

Two interchangeable views, **toggled by tapping the gauge itself** (no separate toggle button):

- **Arc** ([`GaugeArc.jsx`](./src/components/gauge/GaugeArc.jsx)): SVG semicircle with a tapered needle, color zones, tick marks, and animated needle rotation (800ms CSS transition).
- **Bar** ([`GaugeBar.jsx`](./src/components/gauge/GaugeBar.jsx)): Horizontal gradient bar with an overlay indicator that grows from center (700ms transition).

The gauge reads as a pure emotional indicator — no numeric value appears below it and no numeric tick labels appear on the bar. Two semantic labels frame the gauge: **"Disengaged Deepfreeze"** on the freeze side and **"Messy Meltdown"** on the meltdown side.

**Default view**: `bar` on viewports shorter than 800px (more compact), `arc` otherwise. Decided once per `startGame()` / `restartGame()`. If the player taps to override, that choice is respected through subsequent resizes.

### Shake behavior

Because the pin only lives at `{0, +2.5, -2.5}`, the shake collapses to a single binary: **calm** when the pin is at Balance, **danger** any time it's off Balance. The danger shake is a tight ~0.35s horizontal jitter with a small rotate, repeating every ~0.6s. The gauge waits for the needle (arc) or bar slide (~800ms) to finish before the wrapper starts shaking, so motion never overlaps. The shake is a tension cue rather than a danger warning, since the gauge itself does not end the game.

---

## Energy-Driven Background Tint

The whole screen chrome (App outer, GameScreen wrapper, header, footer) shares a CSS custom property `--bg-energy`. `getEnergyBg(displayEnergy)` in [`src/App.jsx`](./src/App.jsx) interpolates between:

- Cream `#FFF9EF` at energy `0` (Balance)
- Soft pink `#FFC7CB` toward Meltdown
- Soft blue `#C7D0F7` toward Deep Freeze

The interpolation factor is `t = Math.min(|energy| / 2.5, 1)`, so the tint reaches **full saturation at exactly `±2.5`** — which is also where the pin lives after any non-success choice. In practice the background jumps to its endpoint color with the first off-Balance pick and resets to cream the next time the player picks a success option.

The transition uses `transition: background-color 4000ms ease-in-out 800ms` — an 800ms delay then a 4-second fade. The card faces stay cream/red so they pop against the shifting backdrop.

---

## Loss Copy

The lose modal opens with the headline **"Tough shifts."** followed by the strike breakdown (e.g. `2 Meltdowns · 1 Deep Freeze`) and a warm, supportive body:

> *Some stretches feel like that, and plenty of managers have been there. Take a breath, reset your dial, and step back in. The next shift is yours.*

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
