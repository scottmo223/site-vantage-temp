/**
 * Tesla Ball — Interactive plasma ball canvas effect
 *
 * Usage:
 *   import { initTeslaBall } from './tesla-ball.js';
 *   initTeslaBall(document.getElementById('tesla'), { ballSize: 0.15 });
 */

export function initTeslaBall(canvas, options = {}) {
  const CONFIG = {
    ballSize: 0.15,         // Ball radius as fraction of container (0.05 = tiny, 0.25 = large)
    reachMultiplier: 4,     // Cursor trigger distance (multiplier of ball radius)
    speed: 0.3,             // Lightning refresh rate (0.1 = slow/persistent, 1.0 = fast/flickery)
    transparent: false,     // When true, skip background fill (see-through)
    ...options,
  };

  const ctx = canvas.getContext('2d');
  let W, H, cx, cy, ballRadius;
  let mouse = { x: -9999, y: -9999 };
  let time = 0;
  let frameCount = 0;
  let animId = null;

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = canvas.width = rect.width;
    H = canvas.height = rect.height;
    cx = W / 2;
    cy = H / 2;
    ballRadius = Math.min(W, H) * CONFIG.ballSize;
  }

  resize();
  const resizeObserver = new ResizeObserver(resize);
  resizeObserver.observe(canvas.parentElement);

  canvas.addEventListener('mousemove', e => {
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.clientX - rect.left;
    mouse.y = e.clientY - rect.top;
  });
  canvas.addEventListener('mouseleave', () => { mouse.x = -9999; mouse.y = -9999; });
  canvas.addEventListener('touchmove', e => {
    e.preventDefault();
    const rect = canvas.getBoundingClientRect();
    mouse.x = e.touches[0].clientX - rect.left;
    mouse.y = e.touches[0].clientY - rect.top;
  }, { passive: false });
  canvas.addEventListener('touchend', () => { mouse.x = -9999; mouse.y = -9999; });

  // --- Lightning generation ---

  function generateBolt(x1, y1, x2, y2, detail, jitter) {
    const points = [{ x: x1, y: y1 }];
    const dx = x2 - x1;
    const dy = y2 - y1;
    const len = Math.sqrt(dx * dx + dy * dy);
    const segments = Math.max(4, Math.floor(len / detail));
    const nx = -dy / len;
    const ny = dx / len;
    for (let i = 1; i < segments; i++) {
      const t = i / segments;
      const offset = (Math.random() - 0.5) * jitter;
      points.push({ x: x1 + dx * t + nx * offset, y: y1 + dy * t + ny * offset });
    }
    points.push({ x: x2, y: y2 });
    return points;
  }

  function drawBolt(points, alpha, width, hue) {
    if (points.length < 2) return;
    const path = () => {
      ctx.beginPath();
      ctx.moveTo(points[0].x, points[0].y);
      for (let i = 1; i < points.length; i++) ctx.lineTo(points[i].x, points[i].y);
    };
    path();
    ctx.strokeStyle = `hsla(${hue}, 80%, 60%, ${alpha * 0.3})`;
    ctx.lineWidth = width * 4;
    ctx.shadowColor = `hsla(${hue}, 90%, 70%, ${alpha * 0.5})`;
    ctx.shadowBlur = 20;
    ctx.stroke();
    path();
    ctx.strokeStyle = `hsla(${hue}, 70%, 75%, ${alpha * 0.6})`;
    ctx.lineWidth = width * 2;
    ctx.shadowBlur = 10;
    ctx.stroke();
    path();
    ctx.strokeStyle = `hsla(${hue}, 50%, 95%, ${alpha * 0.9})`;
    ctx.lineWidth = width;
    ctx.shadowBlur = 5;
    ctx.stroke();
    ctx.shadowBlur = 0;
  }

  function drawBoltList(bolts) {
    for (const b of bolts) drawBolt(b.points, b.alpha, b.width, b.hue);
  }

  // --- Bolt path caching for speed control ---

  let cachedInternalBolts = null;
  let cachedExternalBolts = null;
  let lastBoltFrame = -999;

  function shouldRegenerateBolts() {
    const interval = Math.max(1, Math.round(1 / CONFIG.speed));
    if (frameCount - lastBoltFrame >= interval) {
      lastBoltFrame = frameCount;
      return true;
    }
    return false;
  }

  function generateInternalBoltPaths() {
    const bolts = [];
    const numBolts = 6 + Math.floor(Math.random() * 4);
    for (let i = 0; i < numBolts; i++) {
      const angle1 = Math.random() * Math.PI * 2;
      const angle2 = angle1 + (Math.random() - 0.5) * Math.PI * 1.4;
      const r1 = ballRadius * (0.15 + Math.random() * 0.3);
      const r2 = ballRadius * (0.6 + Math.random() * 0.35);
      const x1 = cx + Math.cos(angle1) * r1;
      const y1 = cy + Math.sin(angle1) * r1;
      const x2 = cx + Math.cos(angle2) * r2;
      const y2 = cy + Math.sin(angle2) * r2;
      const hue = 240 + Math.random() * 60;
      const alpha = 0.3 + Math.random() * 0.5;
      const points = generateBolt(x1, y1, x2, y2, 8, ballRadius * 0.2);
      const width = 0.8 + Math.random() * 0.5;
      bolts.push({ points, alpha, width, hue });
      if (Math.random() > 0.6 && points.length > 3) {
        const forkIdx = Math.floor(points.length * 0.4 + Math.random() * points.length * 0.4);
        const forkAngle = angle2 + (Math.random() - 0.5) * 1.2;
        const forkR = ballRadius * (0.4 + Math.random() * 0.5);
        const forkEnd = { x: cx + Math.cos(forkAngle) * forkR, y: cy + Math.sin(forkAngle) * forkR };
        const forkPoints = generateBolt(points[forkIdx].x, points[forkIdx].y, forkEnd.x, forkEnd.y, 6, ballRadius * 0.12);
        bolts.push({ points: forkPoints, alpha: alpha * 0.5, width: 0.5, hue });
      }
    }
    return bolts;
  }

  function generateExternalBoltPaths(targetX, targetY, intensity) {
    const bolts = [];
    const angle = Math.atan2(targetY - cy, targetX - cx);
    const numBolts = 1 + Math.floor(intensity * 3);
    for (let b = 0; b < numBolts; b++) {
      const spread = (b - (numBolts - 1) / 2) * 0.08;
      const endX = targetX + (Math.random() - 0.5) * 10;
      const endY = targetY + (Math.random() - 0.5) * 10;
      const sAngle = angle + spread;
      const sX = cx + Math.cos(sAngle) * ballRadius;
      const sY = cy + Math.sin(sAngle) * ballRadius;
      const boltDist = Math.sqrt((endX - sX) ** 2 + (endY - sY) ** 2);
      const jitter = boltDist * 0.15;
      const points = generateBolt(sX, sY, endX, endY, 12, jitter);
      const hue = 250 + Math.random() * 40;
      const alpha = 0.6 + intensity * 0.4;
      bolts.push({ points, alpha, width: 1 + intensity * 1.5, hue });
      for (let f = 0; f < 2; f++) {
        if (Math.random() > 0.4) {
          const fi = Math.floor(points.length * (0.2 + Math.random() * 0.6));
          const fAngle = angle + (Math.random() - 0.5) * 1.5;
          const fLen = boltDist * (0.1 + Math.random() * 0.25);
          const fEnd = { x: points[fi].x + Math.cos(fAngle) * fLen, y: points[fi].y + Math.sin(fAngle) * fLen };
          const fPoints = generateBolt(points[fi].x, points[fi].y, fEnd.x, fEnd.y, 8, fLen * 0.2);
          bolts.push({ points: fPoints, alpha: alpha * 0.35, width: 0.6, hue: hue + 20 });
        }
      }
    }
    return bolts;
  }

  // --- Rendering ---

  function drawSphere() {
    const outerGlow = ctx.createRadialGradient(cx, cy, ballRadius * 0.8, cx, cy, ballRadius * 1.8);
    outerGlow.addColorStop(0, 'hsla(260, 60%, 40%, 0.08)');
    outerGlow.addColorStop(0.5, 'hsla(260, 60%, 30%, 0.03)');
    outerGlow.addColorStop(1, 'transparent');
    ctx.fillStyle = outerGlow;
    ctx.fillRect(0, 0, W, H);

    const grad = ctx.createRadialGradient(cx - ballRadius * 0.3, cy - ballRadius * 0.3, 0, cx, cy, ballRadius);
    grad.addColorStop(0, 'hsla(260, 20%, 18%, 0.4)');
    grad.addColorStop(0.7, 'hsla(260, 30%, 10%, 0.6)');
    grad.addColorStop(0.95, 'hsla(260, 40%, 15%, 0.3)');
    grad.addColorStop(1, 'hsla(260, 50%, 25%, 0.15)');
    ctx.beginPath();
    ctx.arc(cx, cy, ballRadius, 0, Math.PI * 2);
    ctx.fillStyle = grad;
    ctx.fill();

    ctx.beginPath();
    ctx.arc(cx, cy, ballRadius, 0, Math.PI * 2);
    ctx.strokeStyle = 'hsla(260, 40%, 35%, 0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    ctx.beginPath();
    ctx.arc(cx - ballRadius * 0.25, cy - ballRadius * 0.25, ballRadius * 0.35, 0, Math.PI * 2);
    const hlGrad = ctx.createRadialGradient(
      cx - ballRadius * 0.25, cy - ballRadius * 0.25, 0,
      cx - ballRadius * 0.25, cy - ballRadius * 0.25, ballRadius * 0.35
    );
    hlGrad.addColorStop(0, 'hsla(0, 0%, 100%, 0.06)');
    hlGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = hlGrad;
    ctx.fill();
  }

  function drawCore() {
    const pulseR = 3 + Math.sin(time * 3) * 1.5 + Math.random() * 1;
    const coreGrad = ctx.createRadialGradient(cx, cy, 0, cx, cy, pulseR * 6);
    coreGrad.addColorStop(0, 'hsla(270, 80%, 95%, 0.9)');
    coreGrad.addColorStop(0.2, 'hsla(260, 90%, 75%, 0.5)');
    coreGrad.addColorStop(0.5, 'hsla(250, 80%, 50%, 0.15)');
    coreGrad.addColorStop(1, 'transparent');
    ctx.fillStyle = coreGrad;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR * 6, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `hsla(270, 50%, 98%, ${0.7 + Math.random() * 0.3})`;
    ctx.beginPath();
    ctx.arc(cx, cy, pulseR, 0, Math.PI * 2);
    ctx.fill();
  }

  function drawCursor() {
    if (mouse.x < 0) return;
    ctx.beginPath();
    ctx.arc(mouse.x, mouse.y, 3, 0, Math.PI * 2);
    ctx.fillStyle = 'hsla(260, 70%, 85%, 0.8)';
    ctx.shadowColor = 'hsla(260, 90%, 70%, 0.6)';
    ctx.shadowBlur = 12;
    ctx.fill();
    ctx.shadowBlur = 0;
  }

  function frame() {
    time += 0.016;
    frameCount++;
    ctx.clearRect(0, 0, W, H);

    if (!CONFIG.transparent) {
      const bg = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.max(W, H) * 0.7);
      bg.addColorStop(0, '#0a0812');
      bg.addColorStop(1, '#020108');
      ctx.fillStyle = bg;
      ctx.fillRect(0, 0, W, H);
    }

    drawSphere();

    ctx.save();
    ctx.beginPath();
    ctx.arc(cx, cy, ballRadius - 1, 0, Math.PI * 2);
    ctx.clip();
    drawCore();
    const regen = shouldRegenerateBolts();
    if (regen || !cachedInternalBolts) cachedInternalBolts = generateInternalBoltPaths();
    drawBoltList(cachedInternalBolts);
    ctx.restore();

    const dx = mouse.x - cx;
    const dy = mouse.y - cy;
    const dist = Math.sqrt(dx * dx + dy * dy);
    const threshold = ballRadius * CONFIG.reachMultiplier;

    if (dist < threshold && dist > ballRadius * 0.5) {
      const intensity = 1 - (dist - ballRadius) / (threshold - ballRadius);
      const clampedIntensity = Math.max(0, Math.min(1, intensity));
      if (clampedIntensity > 0.05) {
        if (regen || !cachedExternalBolts) cachedExternalBolts = generateExternalBoltPaths(mouse.x, mouse.y, clampedIntensity);
        drawBoltList(cachedExternalBolts);
        const impactGrad = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 20 + clampedIntensity * 15);
        impactGrad.addColorStop(0, `hsla(260, 80%, 85%, ${clampedIntensity * 0.4})`);
        impactGrad.addColorStop(1, 'transparent');
        ctx.fillStyle = impactGrad;
        ctx.beginPath();
        ctx.arc(mouse.x, mouse.y, 20 + clampedIntensity * 15, 0, Math.PI * 2);
        ctx.fill();
      }
    }

    drawCursor();
    animId = requestAnimationFrame(frame);
  }

  animId = requestAnimationFrame(frame);

  // Return a cleanup function
  return function destroy() {
    cancelAnimationFrame(animId);
    resizeObserver.disconnect();
  };
}
