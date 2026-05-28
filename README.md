# Shift Survival

A mobile-first leadership simulation from **SmoothieKing Learnings**, designed for our store managers. Players navigate 10 shifts of real workplace scenarios, choosing how to lead under pressure. The core insight we wanted to teach: a great manager doesn't just read the room — they set it.

---

## The Concept

The game is grounded in a single metaphor:

> A thermometer reads the temperature. A thermostat sets it.

Each shift, the team scans you. Walk in tense and the crew rises to match; show up checked-out and the team freezes. Stay steady and you give them confidence to win the shift.

Every scenario presents a moment with two options: one models steady leadership, the other tips the room toward **Meltdown** (stress, panic, anger) or **Deep Freeze** (apathy, disengagement, lack of care). You have **three lives**. Three bad moves and the thermostat breaks — the team quits, reviews tank, sales plummet.

---

## Tech Stack

| Layer | Technology |
|---|---|
| Framework | React 18 + Vite 5 |
| Animation | Framer Motion 11 |
| Styling | Tailwind CSS 3 + inline CSS-in-JS + CSS custom properties |
| Confetti | canvas-confetti |
| Fonts | Playfair Display (headings), DM Sans (body) |
| Build target | Mobile browser (480px max-width, 100dvh) |

---

## Project Structure

```
src/
├── App.jsx                      # Root — screen routing, modal orchestration, energy-driven bg tint
├── main.jsx                     # React entry point
├── data/
│   └── cards.js                 # SHIFT_DECK (21 active choice cards) + an earlier CARD_DECK kept for reference
├── hooks/
│   └── useGameState.js          # All game logic, state machine, scoring, strike tracking
└── components/
    ├── WelcomeScreen.jsx         # 4-step intro flow shell (landing + 3 tutorial steps)
    ├── GameScreen.jsx            # Active gameplay layout (tap gauge to toggle view)
    ├── intro/
    │   ├── LandingStep.jsx       # Step 0: Start Shift + Tutorial CTAs
    │   ├── MetaphorStep.jsx      # Step 1: thermostat metaphor + outcome legend
    │   ├── ChoiceDemoStep.jsx    # Step 2: interactive demo card walkthrough
    │   ├── RulesStep.jsx         # Step 3: goal + 3-strikes rules
    │   └── DemoFeedbackModal.jsx # Tutorial feedback overlay
    ├── cards/
    │   ├── CardShell.jsx         # Shared card template (responsive padding/typography)
    │   ├── ChoiceCard.jsx        # Interactive card with 3D flip reveal
    │   └── EnvironmentCard.jsx   # Static env card (not drawn in the active deck)
    ├── gauge/
    │   ├── GaugeArc.jsx          # SVG semicircle gauge with animated needle
    │   └── GaugeBar.jsx          # Horizontal segment bar (default on short viewports)
    ├── history/
    │   └── HistoryStack.jsx      # Fanned card stack + full-screen carousel
    ├── modals/
    │   ├── WinModal.jsx          # Win screen with confetti, score, count-up
    │   └── LoseModal.jsx         # Lose screen — "Tough shifts." + strike breakdown
    └── ui/
        ├── ActionFooter.jsx      # Fixed bottom: progress bar + fruit lives + CTA
        ├── GaugeToggle.jsx       # Unused — the gauge view is toggled by tapping the gauge directly
        ├── AutoplayButton.jsx    # Unused — autoplay is not part of the active flow
        └── Pill.jsx              # Reusable impact badge
```

---

## Game State Machine

All game logic lives in `useGameState.js`. State is managed with `useState` and `useCallback` — no external state libraries.

### Screens

```
welcome  →  game  →  win
                 ↘  lose
```

- **welcome**: 4-step intro (landing + 3-step tutorial)
- **game**: Active play (10 shifts)
- **win**: Player reached the end of shift 10 with fewer than 3 strikes
- **lose**: Player accumulated 3 strikes (energy ±5 does not end the game)

### Card Phases (within `game` screen)

```
reading  →  revealed  →  animating  →  (next card / reading)
```

| Phase | Description |
|---|---|
| `reading` | Card is visible and interactive |
| `revealed` | Choice card has flipped; feedback + impact pill are showing |
| `animating` | Locked — gauge animating, card exiting (650ms) |

The atomic state update (card swap + history push) fires at the end of the 650ms timeout so the active card visually becomes the top of the history stack rather than disappearing independently.

---

## The Strike System

Every choice option carries an `outcome` of `"success"`, `"meltdown"`, or `"freeze"`.

- **Success** options pull energy back toward 0 (`energyImpact: "balance"`) and cost no lives.
- **Meltdown** options push energy `+1` and **cost one life** (a strike).
- **Freeze** options push energy `-1` and **cost one life** (a strike).

You start with 3 lives, visualized as 🍓 🫐 🍌 in the footer. On a strike, the rightmost surviving fruit dims to grayscale. Three strikes ends the game.

The energy gauge is a **visual feedback signal only** — it can pin at ±5 without triggering a loss. It drives subtle background-color tinting (cool blue toward freeze, warm pink toward meltdown).

---

## Card Data

Active cards live in `SHIFT_DECK` in `src/data/cards.js` — 21 choice cards drawn from for every game. An earlier `CARD_DECK` (12 environment + 12 prior choice cards) sits at the top of the file as a content reference and is not drawn from in live play.

### Shift Card Schema

```js
{
  id: "shift-01",
  type: "choice",
  label: "Shift Scenario",
  title: "The Heavy Rain Slowdown",
  description: "It's been pouring for hours. The store is empty…",
  balanceLean: "freeze",                // which side the wrong option leans toward
  options: [
    {
      id: "A",
      text: "Use the quiet to schedule next week.",
      energyImpact: -1,                 // -1 freeze, +1 meltdown, "balance" success
      outcome: "freeze",                // "success" | "meltdown" | "freeze"
      educationalMessage: "Energy was low and you bailed…",
    },
    {
      id: "B",
      text: "Run a \"tasting challenge.\"",
      energyImpact: "balance",
      outcome: "success",
      educationalMessage: "You sparked interest during a slump…",
    },
  ],
}
```

The special value `"balance"` resolves dynamically at play time:
- `+1` if current energy is negative (pulls toward 0)
- `-1` if current energy is positive (pulls toward 0)
- `0` if already at 0

### History Entry

When a shift completes, the card is pushed to the history array with metadata:

```js
{
  ...card,
  roundNumber: 1–10,
  appliedEnergy: -5 to +5,
  energyDelta: actual change applied,
  chosenOptionId: "A" | "B" | null,
}
```

---

## Deck Building

`buildDeck()` in `useGameState.js`:

1. Partitions the 21 shift cards by `balanceLean` (meltdown-leaning vs. freeze-leaning)
2. Shuffles each pool, picks ~5 from each side
3. If one side has fewer than half, fills the gap from the other pool
4. Final shuffle so the lean order is random

This guarantees variety in every game — no run is all heat or all cold.

---

## Scoring System

Scoring math is computed in `calcChoicePoints()`.

### Base points (0–2 per choice)

Compares what actually happened to what would have happened with the other option:

| Outcome | Points |
|---|---|
| Chosen option moved energy closer to 0 than the alternative | 2 |
| Both options were equally close to 0 (tie) | 1 |
| Chosen option moved energy further from 0 | 0 |

### Timing bonus

Rewards decisive leadership under pressure:

| Decision time | Bonus |
|---|---|
| Under 6 seconds | +1 |
| 6 seconds or more | +0 |

### Final Score

```
score % = (total points earned ÷ total base points possible) × 100
```

`total base points possible = choice card count × 2`. The timing bonus is earned on top of this — fast, accurate decisions can push the score above 100%.

**On a loss, the score is not shown** — the lose modal stays purely supportive and strike-focused.

### Score Tiers (Win Modal)

| Score | Tier |
|---|---|
| 90–100+ | Steady hand. You set the temperature. |
| 70–89 | You kept the thermostat humming. |
| 50–69 | Solid shifts. Keep blending. |
| 0–49 | Every shift teaches you the dial. |

---

## Intro Flow

The intro is a 4-step sequence managed by `WelcomeScreen.jsx`. Steps 0 and 2 are "self-navigating" — they manage their own CTAs inside the component.

| Step | Component | Description |
|---|---|---|
| 0 | `LandingStep` | Brand logo, title ("Shift Survival"), value statement, **Tutorial** + **Start Shift** CTAs |
| 1 | `MetaphorStep` | Live oscillating gauge, outcome legend (Meltdown / Deep Freeze / Steady), "Why does this matter?" accordion |
| 2 | `ChoiceDemoStep` | Player makes a real choice on a demo card; `DemoFeedbackModal` shows outcome with "TUTORIAL" tag |
| 3 | `RulesStep` | "Survive 10 Shifts" goal + 3 numbered rules (face the scenario, two ways to lose, three strikes) |

The top bar (progress dots + Skip Intro link) is hidden on the landing step so the two-CTA layout stays clean. The dots track only the 3 tutorial steps.

A user who clicks **Start Shift** bypasses the tutorial entirely. Clicking **Tutorial** walks them through the 3 educational steps before launching the game.

---

## Gauge

Two interchangeable views, **toggled by tapping the gauge itself** (no separate toggle button):

- **Arc** (`GaugeArc.jsx`): SVG semicircle with a tapered needle, color zones (blue left, white center, red right), tick marks, and animated needle rotation (800ms CSS transition)
- **Bar** (`GaugeBar.jsx`): Horizontal gradient bar with an overlay indicator that grows from center (700ms transition)

The gauge reads as a pure emotional indicator — no numeric value appears below it and no numeric tick labels appear on the bar. The "Disengaged Deepfreeze" / "Messy Meltdown" / "Lost" semantic labels remain.

**Default view**: `bar` on viewports shorter than 800px (more compact), `arc` otherwise. Decided once per `startGame()` / `restartGame()` based on `window.innerHeight`.

### Shake warnings

Both views shake when energy moves off center:

- **±1**: Gentle shake (warn), ~1.2s repeat interval
- **±2 and beyond**: Rapid shake (danger), ~0.6s repeat interval

The shake is a tension cue rather than a danger warning, since the gauge itself does not end the game.

---

## Energy-Driven Background Tint

The whole screen chrome (App outer, GameScreen wrapper, header, footer) shares a CSS custom property `--bg-energy` that interpolates between:

- Cream `#FFF9EF` at energy 0
- Warm pink `#FF95A8` at energy +5
- Cool blue `#8FA8FF` at energy −5

Computed in `App.jsx` via `getEnergyBg(displayEnergy)`. The transition uses `transition: background-color 4000ms ease-in-out 800ms` — an 800ms delay then a 4-second fade. The card faces stay cream/red so they pop against the shifting backdrop.

---

## History Stack

`HistoryStack.jsx` provides two modes:

- **Collapsed (in-game)**: Up to 4 past cards fan out behind the active card with slight rotation and vertical offset, giving depth without obscuring gameplay
- **Expanded (full-screen)**: A portal-based horizontal carousel with snap scrolling, dot indicators, and all played cards replayed with the chosen option frozen in the highlighted state

The portal escapes the game layout's transform context to prevent clipping artifacts on the overlay.

---

## Action Footer

`ActionFooter.jsx` is fixed to the bottom of the screen. It contains a **status row** (shift progress + lives) above the CTA.

### Status row

| Side | Content |
|---|---|
| Left | Label `Shift {N}` over a 10-segment progress bar that fills the remaining horizontal space |
| Right | Label `LIVES` over 🍓 🫐 🍌 |

The progress bar segments use:

- Brand red `#930018` for completed shifts
- Bright red `#E31F26` for the active shift
- Faded `rgba(147,0,24,0.15)` for upcoming shifts

Each segment is `flex: 1` with `max-width: 28px` and a 2px gap so the bar reads as a tight stack rather than discrete tiles.

### Lives

The fruit emojis hop occasionally — `y: [0, -5, 0, -1.4, 0]` keyframes with mixed easing (`['easeOut', 'easeIn', 'easeOut', 'easeIn']`) and a small secondary bounce on landing. Each fruit is staggered (delays 0 / 3.2s / 6.4s) and the cycle repeats every ~10 seconds. Used fruits stop hopping, dim to `opacity: 0.3` and `grayscale(100%)`. The hop is purely a transform, so the row height is unchanged.

### CTA states

| State | Label | Behavior |
|---|---|---|
| Choice card, no selection | Confirm (disabled) | Waits for a selection |
| Choice card, option selected | Confirm (active) | Flips card to reveal |
| Revealed choice card | Understood | Applies energy delta, increments strike if outcome ≠ success |

---

## Responsive Card Layout

A `@media (max-height: 800px)` block in `src/index.css` overrides a set of CSS custom properties for compact viewports:

| Variable | Default | Short viewport |
|---|---|---|
| `--card-title-size` | 30px | 22px |
| `--card-desc-size` | 12px | 11px |
| `--card-padding` | 24px 22px | 14px 16px |
| `--card-option-padding` | 14px 20px | 11px 16px |
| `--card-option-gap` | 10px | 7px |
| `--card-revealed-padding` | 28px 20px | 14px 14px |
| `--card-revealed-title-size` | 24px | 17px |
| `--card-revealed-title-mb` | 20px | 8px |
| `--card-revealed-gap` | 12px | 7px |
| `--revealed-option-padding` | 14px 16px | 9px 12px |
| `--revealed-option-fontsize` | 12px | 11px |
| `--revealed-message-fontsize` | 11px | 10.5px |
| `--revealed-pill-padding` | 4px 14px | 3px 10px |
| `--revealed-pill-fontsize` | 12px | 10px |
| `--type-header-crown-size` | 22px | 16px |
| `--type-header-margin-bottom` | 8px | 4px |
| `--gauge-min-height` | 130px | 100px |
| `--footer-height` | 120px | 112px |

Option button padding tightens but its font size stays at 13px so touch targets remain healthy.

---

## Visual Language

| Element | Color | Meaning |
|---|---|---|
| Deep red `#930018` | Primary actions, completed shifts, meltdown text | Energy / urgency |
| Bright red `#E31F26` | Active shift segment | "You are here" |
| Blue `#004E93` / `#D6E0FF` | Deep freeze states, freeze labels | Cold / disengagement |
| Cream `#FFF9EF` | Neutral base background | Calm / balance |
| Warm pink `#FF95A8` | Bg tint at full meltdown (energy +5) | Stress / heat |
| Cool blue `#8FA8FF` | Bg tint at full freeze (energy −5) | Apathy / cold |
| Pink `#FFDEE5` | Win modal accent, demo pill backgrounds | Care |
| Gold accent | Confetti on win | Celebration |

---

## Loss Copy

The lose modal opens with the headline **"Tough shifts."** followed by the strike breakdown (e.g. `2 Meltdowns · 1 Deep Freeze`) and a warm, supportive body:

> *Some stretches feel like that — and even the best managers have lived through one. Take a breath, reset your dial, and step back in. The next shift is yours.*

No score is shown on a loss. Strike severity is intentionally not weighted — every wrong call counts equally.

---

## Running Locally

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

Every push to `main` triggers `.github/workflows/deploy.yml`, which installs dependencies with `npm ci`, runs `npm run build` with `VITE_BASE_PATH` set to the repo sub-path, and publishes `dist/` via the official `actions/deploy-pages` action. No manual release step is required — merging to `main` is the release.

The same `dist/` artifact can also be uploaded into Articulate Rise or any other LMS that accepts embedded HTML packages; in that case, build locally without `VITE_BASE_PATH` so the asset paths stay relative.

---

## Iframe Integration

The game is built to be embedded inside an `<iframe>` on any host (LMS, intranet, marketing page). Embedding contract below.

### Embedding

```html
<iframe
  src="https://your-host.example.com/shift-survival/?parentOrigin=https%3A%2F%2Fyour-host.example.com"
  title="Shift Survival"
  style="width: 100%; height: 100dvh; min-height: 520px; border: 0;"
  allow="autoplay">
</iframe>
```

The iframe needs a **minimum height of about 520px**. Below that the game renders a friendly "expand for the full experience" placeholder rather than clipping.

### URL parameters

| Param | Value | Effect |
|---|---|---|
| `autostart` | `1` | Skip the welcome screen and drop the player directly into the first shift |
| `skipIntro` | `1` | Alias of `autostart=1` |
| `parentOrigin` | URL-encoded origin | Locks `postMessage` to a specific parent origin. Without this, messages are sent to `*` and inbound messages from any origin are accepted. |

### Host ↔ game postMessage contract

The game emits structured events to `window.parent` on milestone transitions. Wire up a listener on the host:

```js
window.addEventListener('message', (e) => {
  // Optional: only trust messages from your iframe origin.
  if (e.origin !== 'https://your-iframe-host.example.com') return
  const data = e.data
  if (!data?.type?.startsWith('shiftSurvival:')) return
  switch (data.type) {
    case 'shiftSurvival:ready':   /* iframe mounted, fonts loading */ break
    case 'shiftSurvival:start':   /* player started a game */          break
    case 'shiftSurvival:win':     /* { score, maxScore, percent } */   break
    case 'shiftSurvival:lose':    /* { strikeBreakdown }          */   break
    case 'shiftSurvival:restart': /* player chose to play again */     break
    case 'shiftSurvival:resize':  /* { width, height, desiredHeight } — resize wrapper to desiredHeight */ break
  }
})
```

Inbound commands the host can send to the iframe:

```js
const iframe = document.querySelector('iframe')
// Skip welcome and start immediately:
iframe.contentWindow.postMessage({ type: 'shiftSurvival:start' }, '*')
// Reset to welcome screen:
iframe.contentWindow.postMessage({ type: 'shiftSurvival:restart' }, '*')
```

### CSP / framing requirements

The game uses Google Fonts at runtime. If the host page enforces a strict Content-Security-Policy, allow:

```
font-src  https://fonts.gstatic.com;
style-src https://fonts.googleapis.com 'unsafe-inline';
```

If your hosting target sets `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, the iframe will refuse to load. Configure the host to allow framing from the parent's origin (`frame-ancestors https://parent.example.com`).

### Keyboard shortcuts

Useful for LMS-embedded scenarios where players keyboard their way through:

| Key | Action |
|---|---|
| `1` or `A` | Select option A |
| `2` or `B` | Select option B |
| `Enter` / `Space` | Confirm a selection, or acknowledge a revealed card |

### Performance under embed

- Background-color transitions, gauge shake, and the fruit hop loop **pause when `document.visibilityState === 'hidden'`** (tab in background, iframe collapsed in an accordion). No CPU spent off-screen.
- Gauge view (arc vs. bar) re-evaluates on `window.resize`. If the user has tapped to override, their choice is respected through subsequent resizes.

---

## About

**Shift Survival** is part of the **SmoothieKing Learnings** leadership curriculum, made for the people running our stores every day. The repo is published publicly so partners, hosts, and curious learners can see how the experience is built and embed it in their own training environments.

For questions about the program or how to use it inside your store, reach out to the SmoothieKing Learnings team.
