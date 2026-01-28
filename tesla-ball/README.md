# Tesla Ball

Interactive plasma/tesla ball canvas effect. Zero dependencies — pure Canvas 2D.

## Quick Start

```html
<div style="width: 600px; height: 400px;">
  <canvas id="tesla"></canvas>
</div>

<script type="module">
  import { initTeslaBall } from './tesla-ball.js';
  initTeslaBall(document.getElementById('tesla'));
</script>
```

The canvas fills its parent container and resizes automatically via `ResizeObserver`.

## Options

Pass a config object as the second argument:

```js
initTeslaBall(canvas, {
  ballSize: 0.15,        // radius as fraction of container (0.05–0.25)
  reachMultiplier: 4,    // cursor trigger distance (× ball radius)
  speed: 0.3,            // bolt refresh rate (0.1 = slow, 1.0 = fast)
});
```

## Cleanup

`initTeslaBall` returns a `destroy()` function that cancels the animation loop and disconnects the resize observer:

```js
const destroy = initTeslaBall(canvas);
// later...
destroy();
```

## 11ty Integration

Drop the `tesla-ball/` directory into your assets or includes. Reference it from a template:

```html
<div class="tesla-wrapper">
  <canvas id="tesla"></canvas>
</div>
<script type="module">
  import { initTeslaBall } from '/assets/tesla-ball/tesla-ball.js';
  initTeslaBall(document.getElementById('tesla'));
</script>
```

Style `.tesla-wrapper` to whatever size you need. The effect adapts.

## Demo

Open `demo.html` in a browser for a fullscreen demo.
