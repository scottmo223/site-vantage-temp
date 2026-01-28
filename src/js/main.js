import * as THREE from 'three';
import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';
import { initTeslaBall } from '/tesla-ball/tesla-ball.js';

// ── Three.js scene ──
const canvas = document.getElementById('three-canvas');
const scene = new THREE.Scene();
scene.background = null;

const camera = new THREE.PerspectiveCamera(
  75,
  window.innerWidth / window.innerHeight,
  0.1,
  1000
);
camera.position.z = 5;

const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

function resizeRenderer() {
  const rect = canvas.parentElement
    ? canvas.getBoundingClientRect()
    : { width: window.innerWidth, height: window.innerHeight };
  renderer.setSize(rect.width, rect.height, false);
  camera.aspect = rect.width / rect.height;
  camera.updateProjectionMatrix();
}
resizeRenderer();

// Lighting
const ambient = new THREE.AmbientLight(0xffffff, 0.6);
scene.add(ambient);

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(5, 5, 5);
scene.add(dirLight);

const rimLight = new THREE.DirectionalLight(0x8877cc, 0.4);
rimLight.position.set(-3, 2, -3);
scene.add(rimLight);

// ── Load logo GLB (left side) ──
const logoLoader = new GLTFLoader();
let logoModel = null;

logoLoader.load('/public/logo-web-icon.glb', (gltf) => {
  logoModel = gltf.scene;
  // ── Adjust logo size here (smaller number = smaller logo) ──
  const LOGO_SCALE = 0.024;
  logoModel.scale.set(LOGO_SCALE, LOGO_SCALE, LOGO_SCALE);
  logoModel.position.set(0, 0, 0);
  scene.add(logoModel);
});

// ── Tesla ball ──
const teslaCanvas = document.getElementById('tesla');
initTeslaBall(teslaCanvas, {
  ballSize: 0.17,
  reachMultiplier: 4,
  speed: 0.3,
  transparent: true,
});

// ── Resize ──
window.addEventListener('resize', resizeRenderer);

// ── Animate ──
let lastTime = performance.now();

function animate() {
  requestAnimationFrame(animate);

  const now = performance.now();
  const delta = (now - lastTime) / 1000;
  lastTime = now;

  if (logoModel) {
    logoModel.rotation.y += delta * 0.3;
  }

  renderer.render(scene, camera);
}

animate();
