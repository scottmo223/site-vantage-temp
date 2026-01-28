import { GLTFLoader } from 'three/addons/loaders/GLTFLoader.js';

/**
 * Loads a .glb robot model and returns a portable robot with movement toward a target.
 * @param {THREE} THREE - The Three.js library object
 * @returns {Promise<{ group: THREE.Group, update: (delta: number, target: {x: number, y: number}) => void }>}
 */
export async function createRobot(THREE, { glbPath = '3d-objs/robot.glb' } = {}) {
  const loader = new GLTFLoader();

  const gltf = await new Promise((resolve, reject) => {
    loader.load(glbPath, resolve, undefined, reject);
  });

  const model = gltf.scene;

  const group = new THREE.Group();
  group.add(model);

  // ── Adjust robot size here ──
  // Increase to make bigger, decrease to make smaller
  const ROBOT_SCALE = 0.005;
  model.scale.set(ROBOT_SCALE, ROBOT_SCALE, ROBOT_SCALE);

  // Find bones for animation
  const bones = {};
  const boneNames = [
    'L_shoulder_015', 'R_shoulder_031',
    'L_leg_01', 'R_leg_07',
    'L_arm_019', 'R_arm_035',
  ];
  model.traverse((child) => {
    if (child.isBone && boneNames.includes(child.name)) {
      bones[child.name] = child;
    }
  });

  // Store initial bone rotations to use as rest pose
  const restPose = {};
  for (const [name, bone] of Object.entries(bones)) {
    restPose[name] = bone.rotation.clone();
  }

  // Animation state
  let time = 0;
  let currentRotationY = 0;
  const walkSpeed = 6;
  const walkAmplitude = 0.4;
  const moveSpeed = 0.02;
  const reachDistance = 3.2;

  function update(delta, target) {
    time += delta;

    const dx = target.x - group.position.x;
    const dy = target.y - group.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const proximity = THREE.MathUtils.clamp((distance - 0.5) / (reachDistance - 0.5), 0, 1);

    // Move toward target
    if (distance > 0.5) {
      const moveAmount = Math.min(moveSpeed, distance - 0.5);
      group.position.x += (dx / distance) * moveAmount * proximity;
      group.position.y += (dy / distance) * moveAmount * proximity;
    }

    // Rotate to face target
    const maxRotation = Math.PI * 0.4;
    const targetRotationY = THREE.MathUtils.clamp(dx * 0.5, -maxRotation, maxRotation);
    currentRotationY += (targetRotationY - currentRotationY) * 0.08;
    group.rotation.y = currentRotationY;

    // Walking animation
    const walkPhase = Math.sin(time * walkSpeed) * walkAmplitude * proximity;

    // Legs swing
    if (bones['L_leg_01']) {
      bones['L_leg_01'].rotation.x = restPose['L_leg_01'].x + walkPhase;
    }
    if (bones['R_leg_07']) {
      bones['R_leg_07'].rotation.x = restPose['R_leg_07'].x - walkPhase;
    }

    // Arms swing opposite to legs
    if (bones['L_shoulder_015']) {
      bones['L_shoulder_015'].rotation.x = restPose['L_shoulder_015'].x - walkPhase;
    }
    if (bones['R_shoulder_031']) {
      bones['R_shoulder_031'].rotation.x = restPose['R_shoulder_031'].x + walkPhase;
    }

    // Reaching animation (when close)
    const reachAmount = (proximity - .8) * Math.PI * 0.4;

    if (bones['L_shoulder_015']) {
      bones['L_shoulder_015'].rotation.x += -reachAmount;
      bones['L_shoulder_015'].rotation.z = restPose['L_shoulder_015'].z + (1 - proximity) * 0.3;
    }
    if (bones['R_shoulder_031']) {
      bones['R_shoulder_031'].rotation.x += -reachAmount;
      bones['R_shoulder_031'].rotation.z = restPose['R_shoulder_031'].z - (1 - proximity) * 0.3;
    }
  }

  return { group, update };
}
