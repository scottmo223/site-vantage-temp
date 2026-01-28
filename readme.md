# Vantage Method — Splash Page

## Running locally

```
npm install
npm run dev
```

Opens at `http://localhost:8080`. Live-reloads on file changes.

To build for production: `npm run build` (outputs to `_site/`).

## How the canvases work

There are **two separate canvases** layered on top of each other:

1. **Three.js canvas** (`#three-canvas`) — full-viewport, sits behind everything. Contains:
   - The **spinning logo** (`logo-web-icon.glb`)
   - The **robot** (`robot.glb`)
   - These share the same 3D scene, camera, and lighting

2. **Tesla ball canvas** (`#tesla`) — 2D Canvas API, no Three.js. Positioned over the right 40% of the viewport. Fully independent; has its own animation loop and mouse tracking.

The HTML content (title, tagline, email link) floats above both canvases via CSS z-index.

## Adjusting sizes

### Spinning logo
**File:** `src/js/main.js`, line 43
```js
const LOGO_SCALE = 0.03;
```
Increase for bigger, decrease for smaller. Position is on line 45 (`logoModel.position.set(x, y, z)`).

### Robot
**File:** `advanced-robot/js/robot.js`, line 22
```js
const ROBOT_SCALE = 0.005;
```
Same idea — bigger number = bigger robot. Its starting position is in `src/js/main.js` line 51 (`robot.group.position.set(-3, -1.5, 0)`).

### Tesla ball
**File:** `src/js/main.js`, lines 56–60
```js
initTeslaBall(teslaCanvas, {
  ballSize: 0.15,        // radius as fraction of its container (0.05–0.25)
  reachMultiplier: 4,    // how far cursor triggers lightning (× ball radius)
  speed: 0.3,            // bolt refresh rate (0.1 = slow, 1.0 = fast)
});
```
The tesla ball container size is controlled in CSS (`src/css/style.css`, `#tesla-wrap` — currently `width: 40%; height: 100%`).

## Company info
- **Vantage Method**
- Built on Strategy. Powered by AI. Engineered for Results.
- hello@vantagemethod.com
- Site is blocked from search indexing via `robots.txt` and `<meta name="robots" content="noindex, nofollow">`
