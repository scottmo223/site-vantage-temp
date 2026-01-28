import * as THREE from 'three';
import { createRobot } from './robot.js';

// Scene setup
const canvas = document.getElementById('canvas');
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x111111);

// Camera
const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

// Renderer
const renderer = new THREE.WebGLRenderer({
  canvas,
  antialias: true,
});
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
scene.add(ambientLight);

const directionalLight = new THREE.DirectionalLight(0xffffff, 1);
directionalLight.position.set(5, 5, 5);
scene.add(directionalLight);

// Handle resize
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// Pointer tracking (converts screen coords to world space)
const target = { x: 0, y: 0 };

function updateTarget(event) {
  const ndcX = (event.clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(event.clientY / window.innerHeight) * 2 + 1;

  const vector = new THREE.Vector3(ndcX, ndcY, 0.5);
  vector.unproject(camera);
  const dir = vector.sub(camera.position).normalize();
  const distanceToPlane = -camera.position.z / dir.z;
  const worldPos = camera.position.clone().add(dir.multiplyScalar(distanceToPlane));

  target.x = worldPos.x;
  target.y = worldPos.y;
}

window.addEventListener('pointermove', updateTarget);

// Load robot and start animation
const robot = await createRobot(THREE);
scene.add(robot.group);

let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  robot.update(delta, target);
  renderer.render(scene, camera);
}

animate();
