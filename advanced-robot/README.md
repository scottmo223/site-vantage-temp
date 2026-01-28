# Advanced Robot

A Three.js robot loaded from a `.glb` 3D model with skeletal bone animation. Walks toward the cursor with arm and leg swing, and reaches out when close.

## Files

- `index.html` - Entry point with Three.js import map (CDN)
- `js/main.js` - Scene setup, pointer tracking, render loop
- `js/robot.js` - Portable robot module (loads .glb, animates bones)
- `css/style.css` - Fullscreen canvas styles
- `3d-objs/robot.glb` - 3D robot model

## Usage

Serve this directory with any static file server. The robot walks toward the cursor and reaches out when close.

### Robot module standalone usage

```js
import { createRobot } from './robot.js';
const robot = await createRobot(THREE);
scene.add(robot.group);

// In animation loop:
robot.update(deltaTime, { x: targetX, y: targetY });
```

Note: `createRobot` is async (loads the .glb file). Use top-level await or `.then()`.

### Tuning

In `js/robot.js`:
- `ROBOT_SCALE` (line 22) - Model size. Increase to make bigger, decrease to make smaller.
- `walkSpeed` - How fast limbs swing
- `walkAmplitude` - How far limbs swing
- `moveSpeed` - How fast the robot moves toward the target
- `reachDistance` - Distance at which the robot transitions from walking to reaching

## Dependencies

Three.js r160 loaded via CDN (no bundler needed).
