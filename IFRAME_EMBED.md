# Embedding in Rise 360 or any LMS iframe

The **SmoothieKing Learnings unified iframe contract**, shared across every experience in the `sk-learning` repo. The bridge lives at [`src/utils/iframeBridge.js`](./src/utils/iframeBridge.js); the only value that differs per project is the message namespace. For this project the namespace is **`shiftSurvival`** and the deployed URL is:

> `https://smoothieking-learnings.github.io/leadership_thermostat_game/`

> **In-depth Rise 360 walkthrough:** see [`../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md`](../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md) for the full host ↔ app integration story, scroll-trapping workarounds, and the three Code Block patterns (minimal, pointer-events bypass, app-themed overlay).

Shift Survival is a 10-shift interactive game, so the embedding pattern matters more than it does for the quizzes. The bridge handles `?embed=1`, `?autostart=1`, origin locking, completion firing on win OR lose, and rAF-throttled wheel forwarding for hosts that can briefly toggle `pointer-events: none`. Minimum playable iframe height is **520px**; below that the game renders a friendly "expand for the full experience" placeholder rather than clipping.

---

## 1. Universal URL parameters

| Param | Value | Effect |
| --- | --- | --- |
| `?embed=1` | flag | Explicit embed mode. Auto-detected when the page is loaded inside any iframe — explicit param is for previewing the embed view outside an iframe. |
| `?autostart=1` | flag | Skip the welcome screen and drop the player directly into the first shift. `?skipIntro=1` is accepted as an alias. |
| `?parentOrigin=<encoded>` | URL-encoded origin | Locks `postMessage` to a specific parent origin. Without this, messages go to `*`. Drop the param for SCORM exports where the host origin is unknown. |

---

## 2. Copy-paste-ready iframe snippets

Each snippet below is self-contained — paste it directly into a Rise 360 block. Pick the variant that matches your hosting context. Default recommendation: **§2.5 — Click-to-engage overlay** because the game is interactive and benefits from scroll-passthrough.

### 2.1 Minimal Embed block (no scroll-passthrough)

Paste into a Rise 360 **Embed block** (not the Custom Code Block — they're different).

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1"
  width="100%"
  height="780"
  style="border:0; display:block; width:100%; min-height:520px;"
  scrolling="auto"
  title="Shift Survival"
  allow="autoplay"
  allowfullscreen></iframe>
```

**Why 780px?** It sits under the in-app `@media (max-height: 800px)` compressed-layout breakpoint, so cards fit without forcing the action footer smaller than the touch-target spec.

### 2.2 Origin-locked, fixed height (recommended for live Rise lessons)

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
  width="100%" height="780"
  style="border:0; display:block; width:100%; min-height:520px;" scrolling="auto"
  title="Shift Survival" allow="autoplay" allowfullscreen></iframe>
```

The `parentOrigin` lock prevents `postMessage` from leaking to other embedders. Drop it for SCORM export where the host origin is unknown at build time.

### 2.3 Dynamic height that adapts to real device width

```html
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1"
  style="border:0; display:block; width:100%; height:max(640px, 1400px - 70vw); min-height:520px;"
  scrolling="auto"
  title="Shift Survival"
  allow="autoplay"
  allowfullscreen></iframe>
```

`height:max(640px, 1400px - 70vw)` means: at least 640px, and taller as the viewport gets narrower. On a real phone (~400px wide), iframe ≈ 1120px. On a real desktop (~1400px wide), iframe ≈ 640px.

**Caveat:** does not respond to Rise's mobile preview pane.

### 2.4 Dual block — per-device visibility

If your Rise plan exposes "Hide on mobile" / "Hide on desktop" toggles on the Embed block (check the block's edit/pencil settings), this is the cleanest setup. Paste each block into its own Embed block and set the visibility toggle:

```html
<!-- Desktop block (set "Hide on mobile" in Rise) -->
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1"
  width="100%" height="640"
  style="border:0; display:block; width:100%; min-height:520px;" scrolling="auto"
  title="Shift Survival" allow="autoplay" allowfullscreen></iframe>
```

```html
<!-- Mobile block (set "Hide on desktop" in Rise) -->
<iframe
  src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1"
  width="100%" height="1150"
  style="border:0; display:block; width:100%; min-height:520px;" scrolling="auto"
  title="Shift Survival" allow="autoplay" allowfullscreen></iframe>
```

### 2.5 Code Block — click-to-engage overlay (scroll-passthrough)

When you want scroll over the embed to flow into the Rise lesson, set `pointer-events: none` on the iframe and reveal an engagement gesture on top of it. Scroll never enters the iframe until the learner clicks the pill; click outside (or on win/lose) returns to scroll-passthrough.

**Paste into a Rise 360 Code Block** (not the Embed block — Code Block accepts `<style>` and `<script>`).

```html
<style>
  #app-wrap { position: relative; width: 100%; }
  #app-wrap iframe {
    display: block; width: 100%; height: 780px; min-height: 520px; border: 0;
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
    #app-wrap iframe { height: 90vh; max-height: 1150px; min-height: 600px; }
  }
</style>

<div id="app-wrap">
  <iframe id="app-iframe"
    src="https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1&parentOrigin=https%3A%2F%2Frise.articulate.com"
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

### 2.6 Themed welcome overlay (no separate engagement pill)

For the cleanest, most native-feeling embed: replicate the game's welcome card inside the Code Block, drop the iframe behind it with `pointer-events: none`, and post `shiftSurvival:start` when the learner clicks **Start Shift**. Pass `?autostart=1` so the iframe skips its own welcome the moment it becomes interactive.

The full markup for this **Pattern C** is in section 5 of [`../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md`](../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md) — too long to inline here, but a copy-paste affair. Substitute `myApp` → `shiftSurvival` in the markup.

---

## 3. Universal `postMessage` contract

The bridge namespaces every outbound event with `shiftSurvival:`. The `complete` signal is intentionally **not** namespaced — Rise 360's completion field listens for that exact bare message.

### Outbound — app → host

| Event | Payload | Fires when |
| --- | --- | --- |
| `shiftSurvival:ready` | — | App has mounted |
| `shiftSurvival:start` | — | Player started a game |
| `shiftSurvival:win` | `{ score, maxScore, percent }` | Player reached the end of shift 10 with fewer than 3 strikes |
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

The completion field registers the bare `complete` message Rise should accept — the actual fire comes from the iframe. Idempotent: once the lesson is complete, repeat fires are ignored.

---

## 5. Keyboard shortcuts

Useful for LMS-embedded scenarios where players keyboard their way through:

| Key | Action |
| --- | --- |
| `1` or `A` | Select option A on the active card |
| `2` or `B` | Select option B on the active card |
| `Enter` / `Space` | Confirm a selection, or acknowledge a revealed card |
| `Tab` | Move focus through interactive elements (welcome / win / lose screens) |
| `Shift` + `Tab` | Move focus backwards |

All interactive elements have visible focus indicators so the keyboard path is unambiguous.

---

## 6. CSP / framing requirements

This project loads **Playfair Display** + **DM Sans** from Google Fonts at runtime. If the host page enforces a strict Content-Security-Policy, allow:

```
font-src  https://fonts.gstatic.com;
style-src https://fonts.googleapis.com 'unsafe-inline';
```

If your hosting target sets `X-Frame-Options: DENY` or `Content-Security-Policy: frame-ancestors 'none'`, the iframe will refuse to load. Configure the host to allow framing from the parent's origin:

```
Content-Security-Policy: frame-ancestors https://rise.articulate.com;
```

GitHub Pages doesn't set restrictive `X-Frame-Options` headers, so the published `https://smoothieking-learnings.github.io/...` URL just works in iframes by default.

---

## 7. Common gotchas when pasting into Rise

- **Use straight double quotes** (`"`) — not curly/smart quotes. Pasting from Word, Slack, or some chat clients can silently convert quotes and Rise will reject the iframe.
- **No text between `<iframe>` and `</iframe>`** — Rise rejects iframe HTML with content between the tags.
- **`<style>` tags may be stripped** by the **Embed block** — Rise's Embed block sometimes drops `<style>` blocks for security. Use the **Code Block** for §2.5 / §2.6 patterns that need `<style>` and `<script>`.
- **Wrapping `<div>` may be stripped** in the Embed block — keep the iframe top-level there. The Code Block keeps wrappers intact.

---

## 8. Scroll trapping inside Rise

The number-one frustration with Rise embeds is that scrolling while the cursor is over the iframe doesn't scroll the Rise lesson. Three options, in order of complexity:

- **Plain Embed block (§2.1 / §2.2)** — accept that scroll is trapped while the cursor is over the iframe. Cheapest, fewest moving parts. Fine when the embed sits at the bottom of the lesson.
- **Code Block + click-to-engage overlay (§2.5)** — scroll passes through until the learner clicks to engage. Reverts on win/lose so the learner can keep scrolling once the round ends. **Recommended for Shift Survival** because rounds can run 3–5 minutes and the learner often needs to scroll the rest of the lesson while playing.
- **Themed welcome overlay (§2.6)** — same scroll-passthrough as above, but the engagement gesture *looks* like the game's own welcome card. See [`../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md`](../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md) §5 Pattern C for the full markup.

The bridge emits `shiftSurvival:wheel { deltaY }` on every wheel event inside the iframe as a best-effort signal for non-Rise hosts that *can* briefly toggle `pointer-events: none` based on it.

---

## 9. Things that were tried and did NOT work — don't repeat these

### Vertical centering of content (`my-auto`)

Idea: center game content in iframe so empty cream looks intentional. Failed because flexbox `justify-center` cuts off the top of overflowing content when the iframe is shorter than the content. Made the win / lose modal worse, not better.

### Container queries (`cqw`) for responsive iframe height

Idea: use `height: max(700px, 1500px - 70cqw)` so narrower containers get taller iframes. Works in real browsers. **Does not work in Rise's mobile preview** because Rise's mobile preview is a visual clip of the desktop-rendered iframe, not a real viewport change.

### Dynamic iframe resize via `postMessage`

The bridge emits `shiftSurvival:resize` with a `desiredHeight` recommendation. **Rise's parent doesn't listen for it**, and Rise's sandboxing prevents adding a custom listener that could find and resize the Embed block. The `resize` event is preserved for non-Rise hosts (intranet pages, custom LMS shells) that *can* honor it.

### Auto-fitting iframe to content

Iframes don't have a "size to content" mode. The `height` attribute is fixed unless dynamically resized via JS bridging — and Rise's bridging is locked down.

### `scrolling="no"` to suppress internal scrollbars

Deprecated attribute, no effect on wheel capture in modern browsers. Use the click-to-engage pattern in §2.5 instead.

---

## 10. Fundamental Rise 360 constraints

| Constraint | Implication |
| --- | --- |
| **Iframe height is one fixed value** | Cannot be different per device with a single iframe. Use the dual-block pattern in §2.4 if your Rise plan exposes per-device visibility. |
| **Rise mobile preview ≠ real mobile** | Mobile preview is a visual clip in a desktop browser. Responsive CSS won't change behavior between Rise's preview modes — only on real devices or DevTools (see §11). |
| **Sandboxed download blocked** | Captures from inside Rise silently fail. |
| **No `<style>` blocks in Embed input** | Rise's Embed block strips `<style>` tags. Use the **Code Block** for the §2.5 / §2.6 patterns. |
| **Embed block has built-in padding** | Rise wraps every block in a styled container. Some padding is unavoidable around the iframe — check the block's Format menu (block padding S/M/L) to minimize. |
| **Per-device block visibility** | Some Rise plans/block types let you show a block only on mobile or desktop. If available, the dual-iframe pattern (§2.4) is the cleanest sizing solution. |
| **CSP / framing** | If you host on a domain that emits `X-Frame-Options: DENY` or `frame-ancestors 'none'`, the iframe will refuse to load. GitHub Pages doesn't set these headers. |
| **Minimum playable height: 520px** | Below 520px the game renders a friendly placeholder. Ensure your iframe `height` is at least 520. |

---

## 11. How to verify mobile behavior properly

Rise's mobile preview pane is misleading for iframe sizing. To verify how real mobile users will see the game:

1. Open the published GitHub Pages URL directly in a browser:
   `https://smoothieking-learnings.github.io/leadership_thermostat_game/?embed=1`
2. Open Chrome DevTools (F12 / Cmd+Option+I).
3. Click the device toolbar icon (top-left of DevTools, phone/tablet icon).
4. Pick "iPhone 14 Pro" or "Pixel 7" preset.
5. The game reflows at real mobile viewport dimensions.

This is the only reliable way to verify mobile responsiveness without an actual phone.

---

## 12. Performance under embed

- Background-color transitions, gauge shake, and the fruit hop loop **pause when `document.visibilityState === 'hidden'`** (tab in background, iframe collapsed in an accordion). No CPU spent off-screen.
- Gauge view (arc vs. bar) re-evaluates on `window.resize`. If the user has tapped to override their view choice, the override is respected through subsequent resizes.
- All animation timings target 60fps under the click-to-engage pattern; `pointer-events: none` does not impact in-iframe animation cost.

---

## 13. Adapting the bridge for a new project

The bridge is one file. Drop it into `src/utils/iframeBridge.js` and change four lines at the top:

```js
const NAMESPACE = 'yourProject'
const ASPECT_RATIO = 1.6        // height = width × this (portrait-phone band)
const MIN_DESIRED_HEIGHT = 520
const MAX_DESIRED_HEIGHT = 900
```

Wire it in your root component using either the named exports (`emit`, `emitComplete`, `reportSize`, `onCommand`) directly — see [`src/App.jsx`](./src/App.jsx) for the current pattern — or via the `useIframeBridge()` hook for a one-line setup.

---

## 14. File map for future changes

| File | Purpose |
| --- | --- |
| `src/utils/iframeBridge.js` | Universal LMS embed contract — postMessage events + `useIframeBridge` hook |
| `src/App.jsx` | Top-level routing + bridge wiring + energy-driven background tint |
| `src/hooks/useGameState.js` | Game state machine, scoring, strike tracking |
| `src/data/cards.js` | `SHIFT_DECK` (21 active choice cards) + legacy `CARD_DECK` reference |
| `src/utils/useViewport.js` | Short-viewport detection (`useShortViewport`) |
| `.github/workflows/deploy.yml` | GitHub Pages CI |
| `../leadership_style_quiz/RISE360_INTEGRATION_GUIDE.md` | The canonical Rise 360 integration walkthrough across the repo |

---

## 15. Open trade-off

Because iframe height is a single fixed number set in Rise:

- **Tall iframe (~1150px)** → mobile content fits, desktop has blank space.
- **Short iframe (~640px)** → desktop has no blank, mobile content clips below the 520px playable height.
- **Compromise (~780px)** → matches the in-app `max-height: 800px` compressed-layout breakpoint. Current recommendation.

If Rise exposes per-device block visibility for Embed blocks, two iframes (one per device) is cleaner — see §2.4.

---

*Last unified: 2026-06-05. Sibling docs: [appreciation_style_quiz](../appreciation_style_quiz/IFRAME_EMBED.md) · [communication_style_quiz](../communication_style_quiz/IFRAME_EMBED.md) · [leadership_style_quiz](../leadership_style_quiz/IFRAME_EMBED.md).*
