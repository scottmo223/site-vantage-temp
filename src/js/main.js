import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { createRobot } from '/advanced-robot/js/robot.js';
import { initTeslaBall } from '/tesla-ball/tesla-ball.js';

// ── Three.js scene ──
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
// Transparent background so CSS background shows through
scene.background = null;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x8877cc, 0.4);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

// ── Load logo GLB ──
const logoLoader = new GLTFLoader();
let logoModel = null;

logoLoader.load('/public/logo-web-icon.glb', (gltf) => {
  logoModel = gltf.scene;
  // ── Adjust logo size here (smaller number = smaller logo) ──
  const LOGO_SCALE = 0.03;
  logoModel.scale.set(LOGO_SCALE, LOGO_SCALE, LOGO_SCALE);
  logoModel.position.set(0, 1.2, 0);
  scene.add(logoModel);
});

// ── Load robot ──
const robot = await createRobot(THREE, { glbPath: '/advanced-robot/3d-objs/robot.glb' });
robot.group.position.set(-3, -1.5, 0); // start left side
scene.add(robot.group);

// ── Tesla ball ──
const teslaCanvas = document.getElementById('tesla');
const destroyTesla = initTeslaBall(teslaCanvas, {
  ballSize: 0.15,
  reachMultiplier: 4,
  speed: 0.3,
});

// ── Pointer tracking ──
const target = { x: 0, y: 0 };

// Tesla-ball avoidance zone in world coords (right 40% of screen)
function getTeslaZoneWorldX() {
  // Convert 60% screen x to world x
  const ndcX = (0.6) * 2 - 1; // 0.6 of screen width → NDC
  const vec = new THREE.Vector3(ndcX, 0, 0.5);
  vec.unproject(camera);
  const dir = vec.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  const world = camera.position.clone().add(dir.multiplyScalar(dist));
  return world.x;
}

function screenToWorld(clientX, clientY) {
  const ndcX = (clientX / window.innerWidth) * 2 - 1;
  const ndcY = -(clientY / window.innerHeight) * 2 + 1;
  const vec = new THREE.Vector3(ndcX, ndcY, 0.5);
  vec.unproject(camera);
  const dir = vec.sub(camera.position).normalize();
  const dist = -camera.position.z / dir.z;
  return camera.position.clone().add(dir.multiplyScalar(dist));
}

function updateTarget(event) {
  const world = screenToWorld(event.clientX, event.clientY);
  const teslaEdge = getTeslaZoneWorldX();

  // Clamp robot target to stay out of tesla-ball zone (left of the edge with margin)
  target.x = Math.min(world.x, teslaEdge - 0.5);
  target.y = world.y;
}

window.addEventListener('pointermove', updateTarget);

// ── Resize ──
window.addEventListener('resize', () => {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
});

// ── Animate ──
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  // Subtle logo idle rotation
  if (logoModel) {
    logoModel.rotation.y += delta * 0.3;
  }

  robot.update(delta, target);
  renderer.render(scene, camera);
}

animate();
