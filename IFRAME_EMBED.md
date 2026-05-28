# Embedding in Rise 360 or any LMS iframe

The **SmoothieKing Learnings unified iframe contract**, shared across every experience in the `sk-learning` repo. The bridge lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js); the only value that differs per project is the message namespace. For this project the namespace is **`shiftSurvival`** and the deployed URL is:

> `https://smoothieking-learnings.github.io/leadership_thermostat_game/`

Shift Survival is a 10-shift interactive game, so the embedding pattern matters more than it does for the quizzes. The bridge handles `?embed=1`, `?autostart=1`, origin locking, completion firing on win OR lose, and rAF-throttled wheel forwarding for hosts that can briefly toggle `pointer-events: none`.

---

## 1. Universal URL parameters

| Param | Value | Effect |
| --- | --- | --- |
| `?embed=1` | flag | Explicit embed mode. Auto-detected when the page is loaded inside any iframe — explicit param is for previewing the embed view outside an iframe. |
| `?autostart=1` | flag | Skip the welcome screen and drop the player directly into the first shift. `?skipIntro=1` is accepted as an alias. |
| `?parentOrigin=<encoded>` | URL-encoded origin | Locks `postMessage` to a specific parent origin. Without this, messages go to `*`. Drop the param for SCORM exports where the host origin is unknown. |

---

## 2. Recommended iframe snippets

The game needs a **minimum height of about 520px**. Below that the game renders a friendly "expand for the full experience" placeholder rather than clipping.

### Minimum-viable Code Block (Rise 360)

```html
<style>
  #app-wrap { width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; border: 0;
  }
  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 780px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe
    src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?parentOrigin=https%3A%2F%2Frise.articulate.com"
    title="Shift Survival"
    allow="autoplay"
    allowfullscreen></iframe>
</div>
```

780px keeps the iframe under the in-app `@media (max-height: 800px)` compressed-layout breakpoint, so cards fit without forcing the action footer smaller than the touch-target spec.

### Click-to-engage overlay (scroll-passthrough)

When you want scroll over the embed to flow into the Rise lesson, set `pointer-events: none` on the iframe and reveal an engagement gesture on top of it. Scroll never enters the iframe until the learner clicks the pill; click outside (or on win/lose) returns to scroll-passthrough.

```html
<style>
  #app-wrap { position: relative; width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; border: 0;
    pointer-events: none;
    transition: filter 200ms;
    filter: saturate(0.85);
  }
  #app-wrap.engaged iframe { pointer-events: auto; filter: none; }

  #app-overlay {
    position: absolute; inset: 0;
    display: flex; align-items: center; justify-content: center;
    cursor: pointer; transition: opacity 200ms;
  }
  #app-overlay::after {
    content: '▶  Click to play';
    background: #930018; color: #fff;
    font-family: "DM Sans", system-ui, sans-serif; font-weight: 600; font-size: 15px;
    padding: 12px 22px; border-radius: 999px;
    box-shadow: 0 4px 14px rgba(147, 0, 24, 0.35);
  }
  #app-wrap.engaged #app-overlay { opacity: 0; pointer-events: none; }

  @media (max-width: 520px) {
    #app-wrap iframe { height: 90vh; max-height: 780px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe id="app-iframe"
    src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?parentOrigin=https%3A%2F%2Frise.articulate.com"
    title="Shift Survival" allow="autoplay" allowfullscreen></iframe>
  <div id="app-overlay" role="button" aria-label="Click to play Shift Survival"></div>
</div>

<script>
  (function () {
    var wrap = document.getElementById('app-wrap');
    var overlay = document.getElementById('app-overlay');
    overlay.addEventListener('click', function () { wrap.classList.add('engaged'); });
    document.addEventListener('click', function (e) {
      if (!wrap.contains(e.target)) wrap.classList.remove('engaged');
    });
    window.addEventListener('message', function (e) {
      var d = e.data;
      if (d && typeof d === 'object' && (d.type === 'shiftSurvival:win' || d.type === 'shiftSurvival:lose')) {
        wrap.classList.remove('engaged');
      }
    });
  })();
</script>
```

### Themed welcome overlay (no separate engagement pill)

For the cleanest, most native-feeling embed: replicate the game's welcome screen inside the Code Block, drop the iframe behind it with `pointer-events: none`, and post `shiftSurvival:start` when the learner clicks **Start**. Pass `?autostart=1` so the iframe skips its own welcome screen the moment it becomes interactive.

The full markup for this **Pattern C** is in section 5 of [RISE360_INTEGRATION_GUIDE.md](./RISE360_INTEGRATION_GUIDE.md) — too long to inline here, but a copy-paste affair.

### Origin-locked snippet

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?parentOrigin=https%3A%2F%2Frise.articulate.com"
  title="Shift Survival"
  style="width: 100%; height: 780px; min-height: 520px; border: 0;"
  allow="autoplay"
  allowfullscreen></iframe>
```

---

## 3. Universal `postMessage` contract

The bridge namespaces every outbound event with `shiftSurvival:`. The `complete` signal is intentionally **not** namespaced — Rise 360's completion field listens for that exact bare message.

### Outbound — app → host

| Event | Payload | Fires when |
| --- | --- | --- |
| `shiftSurvival:ready` | — | App has mounted |
| `shiftSurvival:start` | — | Player started a game |
| `shiftSurvival:win` | `{ score, maxScore, percent }` | Player reached the end of shift 10 |
| `shiftSurvival:lose` | `{ strikeBreakdown }` | Player accumulated 3 strikes |
| `shiftSurvival:restart` | — | Player chose Play Again from a terminal screen |
| `shiftSurvival:resize` | `{ width, height, desiredHeight }` | Mount + resize + orientation change |
| `shiftSurvival:wheel` | `{ deltaY }` | rAF-throttled wheel forwarding |
| `complete` | — | (Not namespaced) Rise lesson completion — fires once on win OR lose |

### Inbound — host → app

| Event | Effect |
| --- | --- |
| `shiftSurvival:start` | Skip the welcome and start a game |
| `shiftSurvival:restart` | Reset to the welcome screen |

### Wire up a host listener

```js
window.addEventListener('message', (e) => {
  // Optional: only trust messages from your iframe origin.
  // if (e.origin !== 'https://smoothieking-learnings.github.io') return
  const data = e.data
  if (!data?.type) return
  if (data.type === 'complete') return
  if (!String(data.type).startsWith('shiftSurvival:')) return
  switch (data.type) {
    case 'shiftSurvival:ready':   /* iframe mounted */                  break
    case 'shiftSurvival:start':   /* player started a game */            break
    case 'shiftSurvival:win':     /* { score, maxScore, percent } */     break
    case 'shiftSurvival:lose':    /* { strikeBreakdown } */              break
    case 'shiftSurvival:restart': /* player chose to play again */       break
    case 'shiftSurvival:resize':  /* { width, height, desiredHeight } */ break
    case 'shiftSurvival:wheel':   /* { deltaY } */                       break
  }
})
```

### Send a command to the iframe

```js
const iframe = document.querySelector('iframe')
iframe.contentWindow.postMessage({ type: 'shiftSurvival:start' },   '*')  // skip welcome
iframe.contentWindow.postMessage({ type: 'shiftSurvival:restart' }, '*')  // reset to welcome
```

---

## 4. Enabling Rise 360 completion

The bridge calls `emitComplete()` on win OR lose. To wire the lesson to actually mark complete:

1. In the Rise Code Block settings panel, enable **Set completion requirements**.
2. Paste this exact one-liner into the field (this is what Rise listens for):

   ```js
   window.parent.postMessage({ type: 'complete'}, '*')
   ```

Idempotent: once the lesson is complete, repeat fires are ignored.

---

## 5. Keyboard shortcuts

Useful for LMS-embedded scenarios where players keyboard their way through:

| Key | Action |
| --- | --- |
| `1` or `A` | Select option A |
| `2` or `B` | Select option B |
| `Enter` / `Space` | Confirm a selection, or acknowledge a revealed card |

---

## 6. CSP / framing requirements

The game uses Google Fonts at runtime. If the host page enforces a strict Content-Security-Policy, allow:

```
font-src  https://fonts.gstatic.com;
style-src https://fonts.googleapis.com 'unsafe-inline';
```

If your hosting target sets `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, the iframe will refuse to load. Configure the host to allow framing from the parent's origin (`frame-ancestors https://parent.example.com`).

---

## 7. Performance under embed

- Background-color transitions, gauge shake, and the fruit hop loop **pause when `document.visibilityState === 'hidden'`** (tab in background, iframe collapsed in an accordion). No CPU spent off-screen.
- Gauge view (arc vs. bar) re-evaluates on `window.resize`. If the user has tapped to override, their choice is respected through subsequent resizes.

---

## 8. Scroll trapping inside Rise

The number-one frustration with Rise embeds is that scrolling while the cursor is over the iframe doesn't scroll the Rise lesson. Two options:

- **Plain iframe** — accept that scroll is trapped while the cursor is over the iframe. Fine for short lessons where the embed is at the bottom of the block.
- **`pointer-events: none` + click-to-engage overlay** — see §2 above. Scroll passes through until the learner clicks to engage. Wired to revert to scroll-passthrough on win/lose so the learner can keep scrolling once the round ends.

The bridge emits `shiftSurvival:wheel { deltaY }` on every wheel event inside the iframe as a best-effort signal for hosts that *can* briefly toggle `pointer-events: none` based on it.

---

## 9. Fundamental Rise 360 constraints

| Constraint | Implication |
| --- | --- |
| **Iframe height is one fixed value** | Use the dual-iframe pattern if your Rise plan exposes per-device block visibility. |
| **Rise mobile preview ≠ real mobile** | Mobile preview is a visual clip in a desktop browser. |
| **Sandboxed download blocked** | Captures and downloads from inside Rise will silently fail. |
| **No `<style>` blocks in Embed input** | Use the Code Block for the patterns in §2 — Embed block strips `<style>`. |
| **CSP / framing** | See §6. |

---

## 10. Adapting the bridge for a new project

The bridge is one file. Drop it into `src/utils/iframeBridge.js` and change four lines at the top:

```js
const NAMESPACE = 'yourProject'
const ASPECT_RATIO = 1.6        // height = width × this (portrait-phone band)
const MIN_DESIRED_HEIGHT = 520
const MAX_DESIRED_HEIGHT = 900
```

Wire it in your root component using either the named exports (`emit`, `emitComplete`, `reportSize`, `onCommand`) directly — see [`src/App.jsx`](./src/App.jsx) for the current pattern — or via the `useIframeBridge()` hook for a one-line setup.

---

## 11. File map for future changes

| File | Purpose |
| --- | --- |
| `src/utils/iframeBridge.js` | Universal LMS embed contract — postMessage events + `useIframeBridge` hook |
| `src/App.jsx` | Top-level routing + bridge wiring + energy-driven background tint |
| `src/hooks/useGameState.js` | Game state machine, scoring, strike tracking |
| `src/data/cards.js` | `SHIFT_DECK` (21 active choice cards) + legacy `CARD_DECK` reference |
| `src/utils/useViewport.js` | Short-viewport detection (`useShortViewport`) |
| `.github/workflows/deploy.yml` | GitHub Pages CI |

---

## 12. Open trade-off

Because iframe height is a single fixed number set in Rise:

- **Tall iframe** → mobile content fits, desktop has blank space.
- **Short iframe** → desktop has no blank, mobile content clips below the playable height.
- **Compromise (~780px)** → matches the in-app `max-height: 800px` compressed-layout breakpoint and works on both. Current recommendation.

If Rise exposes per-device block visibility for Embed blocks, two iframes (one per device) is cleaner.
