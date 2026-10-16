import { WorldId, Obstacle, Particle } from './types.ts';

export interface WorldRenderContext {
  ctx: CanvasRenderingContext2D;
  width: number;
  height: number;
  groundY: number;
  worldId: WorldId;
  scrollOffset: number;
  time: number;
  transitionProgress?: number; // 0 (current) to 1 (new)
  previousWorldId?: WorldId;
}

function safeRoundRect(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
): void {
  const rad = Math.min(Math.max(0, r), Math.abs(w) / 2, Math.abs(h) / 2);
  ctx.moveTo(x + rad, y);
  ctx.lineTo(x + w - rad, y);
  ctx.quadraticCurveTo(x + w, y, x + w, y + rad);
  ctx.lineTo(x + w, y + h - rad);
  ctx.quadraticCurveTo(x + w, y + h, x + w - rad, y + h);
  ctx.lineTo(x + rad, y + h);
  ctx.quadraticCurveTo(x, y + h, x, y + h - rad);
  ctx.lineTo(x, y + rad);
  ctx.quadraticCurveTo(x, y, x + rad, y);
}

/**
 * Renders the rich multi-layered environment for the active world.
 */
export function renderWorldBackground(ctx: CanvasRenderingContext2D, opts: WorldRenderContext): void {
  const { width, height, groundY, worldId, scrollOffset, time } = opts;

  switch (worldId) {
    case 'farm':
      renderHappyFarmBackground(ctx, width, height, groundY, scrollOffset, time);
      break;
    case 'forest':
      renderMagicForestBackground(ctx, width, height, groundY, scrollOffset, time);
      break;
    case 'candy':
      renderCandyKingdomBackground(ctx, width, height, groundY, scrollOffset, time);
      break;
    case 'space':
      renderCosmicSpaceBackground(ctx, width, height, groundY, scrollOffset, time);
      break;
  }
}

/**
 * WORLD 1: HAPPY FARM
 * Cheerful daylight, puffy clouds, rolling green pastures, rustic fences
 */
function renderHappyFarmBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scroll: number,
  time: number
) {
  // 1. Cheerful Daylight Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#0284c7'); // Rich sky blue
  skyGrad.addColorStop(0.5, '#38bdf8');
  skyGrad.addColorStop(0.85, '#bae6fd');
  skyGrad.addColorStop(1, '#e0f2fe');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // 2. Warm Golden Sun with glowing corona
  const sunX = width * 0.82;
  const sunY = 65;
  ctx.save();
  const sunGlow = ctx.createRadialGradient(sunX, sunY, 15, sunX, sunY, 60);
  sunGlow.addColorStop(0, 'rgba(254, 240, 138, 0.6)');
  sunGlow.addColorStop(1, 'rgba(254, 240, 138, 0)');
  ctx.fillStyle = sunGlow;
  ctx.beginPath();
  ctx.arc(sunX, sunY, 60, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#fde047';
  ctx.beginPath();
  ctx.arc(sunX, sunY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Fluffy Clouds (Parallax 0.08)
  const cloudOffset = (scroll * 0.08) % (width + 360);
  drawFarmCloud(ctx, (80 - cloudOffset + width + 360) % (width + 360) - 100, 45, 0.95);
  drawFarmCloud(ctx, (380 - cloudOffset + width + 360) % (width + 360) - 100, 75, 0.75);
  drawFarmCloud(ctx, (680 - cloudOffset + width + 360) % (width + 360) - 100, 35, 1.15);

  // 4. Distant Mountains (Parallax 0.14)
  const hillOffsetFar = (scroll * 0.14) % 600;
  ctx.fillStyle = '#86efac';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -600; x <= width + 600; x += 150) {
    const rx = x - hillOffsetFar;
    ctx.quadraticCurveTo(rx + 75, groundY - 145, rx + 150, groundY);
  }
  ctx.fill();

  // 5. Midground Rolling Pastures with Passing Farm Landmarks (Parallax 0.32)
  const hillOffsetMid = (scroll * 0.32) % 500;
  ctx.fillStyle = '#4ade80';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -500; x <= width + 500; x += 250) {
    const rx = x - hillOffsetMid;
    ctx.quadraticCurveTo(rx + 125, groundY - 95, rx + 250, groundY);
  }
  ctx.fill();

  // Passing Landmark 1: Traditional Red Barn & Silo (Every 1200px)
  const barnInterval = 1200;
  const barnX = ((450 - scroll * 0.32) % barnInterval + barnInterval) % barnInterval - 150;
  drawHappyFarmBarn(ctx, barnX, groundY - 45);

  // Passing Landmark 2: Farm Windmill with Spinning Blades (Every 900px)
  const windmillInterval = 900;
  const windmillX = ((950 - scroll * 0.32) % windmillInterval + windmillInterval) % windmillInterval - 100;
  drawHappyFarmWindmill(ctx, windmillX, groundY - 42, time);

  // Passing Landmark 3: Apple Orchard Trees (Every 450px)
  const orchardInterval = 450;
  for (let i = 0; i < 3; i++) {
    const treeX = ((i * orchardInterval + 200 - scroll * 0.32) % (orchardInterval * 3) + orchardInterval * 3) % (orchardInterval * 3) - 80;
    drawAppleTree(ctx, treeX, groundY - 25);
  }

  // 6. Near Green Meadow with Rustic Wooden Fence & Sunflowers (Parallax 0.55)
  const hillOffsetNear = (scroll * 0.55) % 350;
  ctx.fillStyle = '#22c55e';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -350; x <= width + 350; x += 175) {
    const rx = x - hillOffsetNear;
    ctx.quadraticCurveTo(rx + 87, groundY - 45, rx + 175, groundY);
  }
  ctx.fill();

  // Wooden fence along the horizon
  const fenceOffset = (scroll * 0.55) % 70;
  ctx.strokeStyle = '#b45309';
  ctx.lineWidth = 3.5;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, groundY - 18);
  ctx.lineTo(width, groundY - 18);
  ctx.moveTo(0, groundY - 10);
  ctx.lineTo(width, groundY - 10);
  ctx.stroke();

  // Fence posts and nodding sunflowers
  for (let x = -70; x <= width + 70; x += 70) {
    const px = x - fenceOffset;
    // Post
    ctx.beginPath();
    ctx.moveTo(px, groundY - 26);
    ctx.lineTo(px, groundY);
    ctx.stroke();

    // Nodding Sunflowers on fence posts
    drawSunflower(ctx, px + 22, groundY - 18, time + x);
  }

  // 7. Drifting Dandelion Fluffs / Floating Butterlies (Lively Farm Motion)
  for (let i = 0; i < 6; i++) {
    const bx = ((i * 150 + scroll * 0.2 + Math.sin(time * 3 + i) * 40) % (width + 60) + width + 60) % (width + 60) - 30;
    const by = groundY - 40 - ((i * 35 + time * 25) % (groundY - 100));
    drawButterfly(ctx, bx, by, time * 12 + i);
  }
}

function drawHappyFarmBarn(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Silo
  ctx.fillStyle = '#94a3b8';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  safeRoundRect(ctx, -25, -55, 18, 55, 8);
  ctx.fill();
  ctx.stroke();

  // Red Wooden Barn Body
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.rect(0, -50, 65, 50);
  ctx.fill();
  ctx.stroke();

  // Barn Gambrel Roof
  ctx.fillStyle = '#991b1b';
  ctx.beginPath();
  ctx.moveTo(-6, -50);
  ctx.lineTo(12, -72);
  ctx.lineTo(32, -80);
  ctx.lineTo(52, -72);
  ctx.lineTo(71, -50);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // White X on barn door
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(18, -32, 28, 32);
  ctx.strokeRect(18, -32, 28, 32);
  ctx.strokeStyle = '#dc2626';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(19, -31);
  ctx.lineTo(45, -1);
  ctx.moveTo(45, -31);
  ctx.lineTo(19, -1);
  ctx.stroke();

  // Small Hayloft window
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(32, -58, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

function drawHappyFarmWindmill(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y);

  // Stone Windmill Tower
  ctx.fillStyle = '#f8fafc';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, 0);
  ctx.lineTo(-8, -65);
  ctx.lineTo(8, -65);
  ctx.lineTo(14, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Conical Cap
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.moveTo(-11, -65);
  ctx.lineTo(0, -78);
  ctx.lineTo(11, -65);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Rotating 4 Windmill Sails
  const rotAngle = time * 2.5;
  ctx.save();
  ctx.translate(0, -65);
  ctx.rotate(rotAngle);
  for (let i = 0; i < 4; i++) {
    ctx.rotate(Math.PI / 2);
    // Sail arm
    ctx.strokeStyle = '#78350f';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, 0);
    ctx.lineTo(0, -38);
    ctx.stroke();
    // Sail canvas
    ctx.fillStyle = 'rgba(254, 243, 199, 0.9)';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 1;
    ctx.beginPath();
    ctx.rect(2, -36, 9, 28);
    ctx.fill();
    ctx.stroke();
  }
  // Central rotor pin
  ctx.fillStyle = '#b45309';
  ctx.beginPath();
  ctx.arc(0, 0, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  ctx.restore();
}

function drawAppleTree(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Brown trunk
  ctx.fillStyle = '#78350f';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-5, 0);
  ctx.lineTo(-3, -28);
  ctx.lineTo(3, -28);
  ctx.lineTo(5, 0);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Fluffy Green Foliage
  ctx.fillStyle = '#16a34a';
  ctx.beginPath();
  ctx.arc(0, -42, 22, 0, Math.PI * 2);
  ctx.arc(-14, -36, 15, 0, Math.PI * 2);
  ctx.arc(14, -36, 15, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Bright Red Apples
  ctx.fillStyle = '#ef4444';
  const apples = [
    [-8, -45],
    [6, -48],
    [-12, -32],
    [10, -34],
    [0, -32]
  ];
  for (const [ax, ay] of apples) {
    ctx.beginPath();
    ctx.arc(ax, ay, 3, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

function drawFarmCloud(ctx: CanvasRenderingContext2D, x: number, y: number, scale: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.scale(scale, scale);
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.arc(22, -8, 26, 0, Math.PI * 2);
  ctx.arc(48, -2, 20, 0, Math.PI * 2);
  ctx.arc(62, 8, 16, 0, Math.PI * 2);
  ctx.arc(16, 12, 18, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawSunflower(ctx: CanvasRenderingContext2D, x: number, y: number, time: number) {
  ctx.save();
  ctx.translate(x, y);
  const sway = Math.sin(time * 3) * 0.1;
  ctx.rotate(sway);

  // Stem
  ctx.strokeStyle = '#15803d';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.moveTo(0, 18);
  ctx.lineTo(0, 0);
  ctx.stroke();

  // Golden Petals
  ctx.fillStyle = '#facc15';
  for (let i = 0; i < 8; i++) {
    const a = (i * Math.PI) / 4;
    ctx.beginPath();
    ctx.ellipse(Math.cos(a) * 7, Math.sin(a) * 7, 4, 2, a, 0, Math.PI * 2);
    ctx.fill();
  }

  // Dark Seed Center
  ctx.fillStyle = '#78350f';
  ctx.beginPath();
  ctx.arc(0, 0, 4.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

function drawButterfly(ctx: CanvasRenderingContext2D, x: number, y: number, flap: number) {
  ctx.save();
  ctx.translate(x, y);
  const wingScale = Math.sin(flap) * 0.8 + 0.2;

  // Yellow/Cyan butterfly wings
  ctx.fillStyle = '#fef08a';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1;

  ctx.save();
  ctx.scale(wingScale, 1);
  ctx.beginPath();
  ctx.ellipse(-3, -2, 5, 3.5, -0.2, 0, Math.PI * 2);
  ctx.ellipse(3, -2, 5, 3.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Little body
  ctx.fillStyle = '#1e293b';
  ctx.beginPath();
  ctx.ellipse(0, 0, 1, 3, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * WORLD 2: MAGIC FOREST
 * Twilight emerald & mystical teal sky, glowing giant mushrooms, fireflies, mossy trees
 */
function renderMagicForestBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scroll: number,
  time: number
) {
  // 1. Mystical Twilight Sky Gradient
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#090d16');
  skyGrad.addColorStop(0.4, '#064e3b'); // Emerald deep forest
  skyGrad.addColorStop(0.85, '#047857');
  skyGrad.addColorStop(1, '#065f46');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // 2. Enchanted Glowing Moon
  const moonX = width * 0.2;
  const moonY = 80;
  ctx.save();
  // Moon Glow
  const moonGlow = ctx.createRadialGradient(moonX, moonY, 15, moonX, moonY, 70);
  moonGlow.addColorStop(0, 'rgba(52, 211, 153, 0.4)');
  moonGlow.addColorStop(1, 'rgba(52, 211, 153, 0)');
  ctx.fillStyle = moonGlow;
  ctx.beginPath();
  ctx.arc(moonX, moonY, 70, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#a7f3d0';
  ctx.beginPath();
  ctx.arc(moonX, moonY, 26, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  // 3. Ancient Tree Trunks Silhouette in Background (Parallax 0.2)
  const treeOffsetFar = (scroll * 0.2) % 360;
  ctx.fillStyle = '#022c22';
  for (let x = -360; x <= width + 360; x += 180) {
    const tx = x - treeOffsetFar;
    ctx.beginPath();
    ctx.moveTo(tx, groundY);
    ctx.lineTo(tx + 25, groundY - 220);
    ctx.lineTo(tx + 55, groundY - 220);
    ctx.lineTo(tx + 80, groundY);
    ctx.closePath();
    ctx.fill();
  }

  // 4. Glowing Giant Mushrooms in Midground (Parallax 0.5)
  const shroomOffset = (scroll * 0.5) % 450;
  for (let x = -450; x <= width + 450; x += 220) {
    const sx = x - shroomOffset;
    drawEnchantedMushroom(ctx, sx, groundY, time);
  }

  // 5. Drifting Fireflies (Pulsing glowing orbs)
  for (let i = 0; i < 8; i++) {
    const fx = (i * 140 + Math.sin(time * 2 + i) * 30 + width) % width;
    const fy = groundY - 40 - ((i * 35 + time * 20) % (groundY - 80));
    const pulse = 0.4 + Math.sin(time * 5 + i * 1.5) * 0.4;
    ctx.save();
    ctx.fillStyle = `rgba(167, 243, 208, ${pulse})`;
    ctx.beginPath();
    ctx.arc(fx, fy, 4, 0, Math.PI * 2);
    ctx.fill();
    ctx.fillStyle = `rgba(254, 240, 138, ${pulse * 1.2})`;
    ctx.beginPath();
    ctx.arc(fx, fy, 2, 0, Math.PI * 2);
    ctx.fill();
    ctx.restore();
  }
}

function drawEnchantedMushroom(ctx: CanvasRenderingContext2D, x: number, groundY: number, time: number) {
  ctx.save();
  ctx.translate(x, groundY);

  // Mushroom stem
  ctx.fillStyle = '#14532d';
  ctx.beginPath();
  ctx.moveTo(-10, 0);
  ctx.quadraticCurveTo(-6, -45, -4, -60);
  ctx.quadraticCurveTo(0, -62, 4, -60);
  ctx.quadraticCurveTo(6, -45, 10, 0);
  ctx.closePath();
  ctx.fill();

  // Glowing Cap (Bioluminescent Cyan/Purple)
  const capGrad = ctx.createLinearGradient(-35, -90, 35, -55);
  capGrad.addColorStop(0, '#06b6d4');
  capGrad.addColorStop(0.5, '#3b82f6');
  capGrad.addColorStop(1, '#8b5cf6');

  ctx.fillStyle = capGrad;
  ctx.beginPath();
  ctx.arc(0, -60, 30, Math.PI, 0);
  ctx.quadraticCurveTo(0, -52, -30, -60);
  ctx.closePath();
  ctx.fill();

  // Bioluminescent glowing spots
  const spotPulse = 0.6 + Math.sin(time * 3 + x) * 0.3;
  ctx.fillStyle = `rgba(207, 250, 254, ${spotPulse})`;
  ctx.beginPath();
  ctx.arc(-14, -72, 3.5, 0, Math.PI * 2);
  ctx.arc(0, -82, 4.5, 0, Math.PI * 2);
  ctx.arc(14, -70, 3.5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * WORLD 3: CANDY KINGDOM
 * Pastel gradient sky, marshmallow hills, giant swirl lollipop trees, gumdrops
 */
function renderCandyKingdomBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scroll: number,
  time: number
) {
  // 1. Pastel Strawberry & Vanilla Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#f472b6'); // Pastel pink
  skyGrad.addColorStop(0.5, '#fbcfe8');
  skyGrad.addColorStop(1, '#fff1f2');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // 2. Cotton Candy Clouds (Parallax 0.15)
  const candyCloudOffset = (scroll * 0.15) % (width + 300);
  drawCandyCloud(ctx, (120 - candyCloudOffset + width + 300) % (width + 300) - 100, 60, '#fce7f3');
  drawCandyCloud(ctx, (450 - candyCloudOffset + width + 300) % (width + 300) - 100, 90, '#ede9fe');

  // 3. Marshmallow Pastel Hills (Parallax 0.3)
  const hillOffset = (scroll * 0.3) % 400;
  ctx.fillStyle = '#fda4af';
  ctx.beginPath();
  ctx.moveTo(0, groundY);
  for (let x = -400; x <= width + 400; x += 180) {
    const rx = x - hillOffset;
    ctx.quadraticCurveTo(rx + 90, groundY - 110, rx + 180, groundY);
  }
  ctx.fill();

  // 4. Giant Swirl Lollipop Trees (Parallax 0.5)
  const lollipopOffset = (scroll * 0.5) % 360;
  for (let x = -360; x <= width + 360; x += 180) {
    const lx = x - lollipopOffset;
    drawLollipopTree(ctx, lx, groundY, time);
  }

  // 5. Floating Sweet Sparkles / Sugar Sprinkles
  for (let i = 0; i < 10; i++) {
    const sx = (i * 100 + scroll * 0.4 + width) % width;
    const sy = 40 + ((i * 45 + time * 30) % (groundY - 90));
    ctx.save();
    ctx.translate(sx, sy);
    ctx.rotate(time * 2 + i);
    ctx.fillStyle = i % 3 === 0 ? '#ec4899' : (i % 3 === 1 ? '#06b6d4' : '#facc15');
    ctx.fillRect(-3, -1.5, 6, 3);
    ctx.restore();
  }
}

function drawCandyCloud(ctx: CanvasRenderingContext2D, x: number, y: number, color: string) {
  ctx.save();
  ctx.translate(x, y);
  ctx.fillStyle = color;
  ctx.beginPath();
  ctx.arc(0, 0, 24, 0, Math.PI * 2);
  ctx.arc(24, -10, 30, 0, Math.PI * 2);
  ctx.arc(52, -2, 22, 0, Math.PI * 2);
  ctx.arc(30, 14, 20, 0, Math.PI * 2);
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

function drawLollipopTree(ctx: CanvasRenderingContext2D, x: number, groundY: number, time: number) {
  ctx.save();
  ctx.translate(x, groundY);

  // Striped candy cane stick
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 8;
  ctx.lineCap = 'round';
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, -90);
  ctx.stroke();

  // Red spiral stripes on stick
  ctx.strokeStyle = '#ef4444';
  ctx.lineWidth = 4;
  ctx.beginPath();
  for (let y = -80; y <= -10; y += 18) {
    ctx.moveTo(-4, y);
    ctx.lineTo(4, y - 6);
  }
  ctx.stroke();

  // Giant Swirl Lollipop head
  const headY = -95;
  ctx.fillStyle = '#ec4899';
  ctx.strokeStyle = '#be185d';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.arc(0, headY, 28, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Swirl spiral
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 4;
  ctx.beginPath();
  const swirlRot = time * 0.5;
  for (let a = 0; a < Math.PI * 4; a += 0.2) {
    const r = (a / (Math.PI * 4)) * 22;
    const px = Math.cos(a + swirlRot) * r;
    const py = headY + Math.sin(a + swirlRot) * r;
    if (a === 0) ctx.moveTo(px, py);
    else ctx.lineTo(px, py);
  }
  ctx.stroke();

  ctx.restore();
}

/**
 * WORLD 4: COSMIC SPACE
 * Deep void, colorful nebulae, parallax stars, distant ringed planets, floating asteroids
 */
function renderCosmicSpaceBackground(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  scroll: number,
  time: number
) {
  // 1. Deep Void Sky
  const skyGrad = ctx.createLinearGradient(0, 0, 0, groundY);
  skyGrad.addColorStop(0, '#020617'); // Pitch deep space
  skyGrad.addColorStop(0.5, '#0f172a');
  skyGrad.addColorStop(0.85, '#1e1b4b'); // Cosmic indigo
  skyGrad.addColorStop(1, '#312e81');
  ctx.fillStyle = skyGrad;
  ctx.fillRect(0, 0, width, groundY);

  // 2. Glowing Colorful Nebulae Clouds
  const nebGrad = ctx.createRadialGradient(width * 0.7, 120, 20, width * 0.7, 120, 260);
  nebGrad.addColorStop(0, 'rgba(192, 132, 252, 0.28)'); // Magenta/purple glow
  nebGrad.addColorStop(0.5, 'rgba(56, 189, 248, 0.15)'); // Cyan rim
  nebGrad.addColorStop(1, 'rgba(0, 0, 0, 0)');
  ctx.fillStyle = nebGrad;
  ctx.fillRect(0, 0, width, groundY);

  // 3. Ringed Planet (Parallax 0.05)
  const planetX = ((width * 0.25 - scroll * 0.05) % (width + 200) + width + 200) % (width + 200) - 100;
  const planetY = 90;
  drawRingedPlanet(ctx, planetX, planetY);

  // 4. Distant Moon / Satellite (Parallax 0.1)
  const moonX = ((width * 0.85 - scroll * 0.1) % (width + 200) + width + 200) % (width + 200) - 100;
  ctx.fillStyle = '#67e8f9';
  ctx.beginPath();
  ctx.arc(moonX, 60, 16, 0, Math.PI * 2);
  ctx.fill();

  // 5. Multi-layer Twinkling Stars (Parallax 0.1 & 0.2)
  for (let i = 0; i < 40; i++) {
    const starX = ((i * 47 - scroll * 0.15) % width + width) % width;
    const starY = (i * 31) % (groundY - 20);
    const twinkle = 0.4 + Math.sin(time * 3 + i) * 0.4;
    ctx.fillStyle = `rgba(255, 255, 255, ${twinkle})`;
    ctx.fillRect(starX, starY, i % 4 === 0 ? 3 : 1.8, i % 4 === 0 ? 3 : 1.8);
  }

  // 6. Floating Asteroid Belt in Background (Parallax 0.3)
  const astOffset = (scroll * 0.3) % 400;
  for (let x = -400; x <= width + 400; x += 160) {
    const ax = x - astOffset;
    const ay = groundY - 100 + Math.sin(ax * 0.02) * 20;
    drawFloatingAsteroid(ctx, ax, ay, 12, time);
  }
}

function drawRingedPlanet(ctx: CanvasRenderingContext2D, x: number, y: number) {
  ctx.save();
  ctx.translate(x, y);

  // Planet body
  const planetGrad = ctx.createRadialGradient(-10, -10, 4, 0, 0, 36);
  planetGrad.addColorStop(0, '#f472b6');
  planetGrad.addColorStop(0.7, '#8b5cf6');
  planetGrad.addColorStop(1, '#4c1d95');
  ctx.fillStyle = planetGrad;
  ctx.beginPath();
  ctx.arc(0, 0, 34, 0, Math.PI * 2);
  ctx.fill();

  // Planet ring behind
  ctx.save();
  ctx.rotate(-0.35);
  ctx.strokeStyle = 'rgba(216, 180, 254, 0.65)';
  ctx.lineWidth = 7;
  ctx.beginPath();
  ctx.ellipse(0, 0, 68, 14, 0, 0, Math.PI * 2);
  ctx.stroke();

  ctx.strokeStyle = 'rgba(168, 85, 247, 0.4)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.ellipse(0, 0, 78, 17, 0, 0, Math.PI * 2);
  ctx.stroke();
  ctx.restore();

  ctx.restore();
}

function drawFloatingAsteroid(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  time: number
) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(time * 0.3 + x);
  ctx.fillStyle = '#475569';
  ctx.strokeStyle = '#1e293b';
  ctx.lineWidth = 1.5;

  ctx.beginPath();
  ctx.moveTo(radius, 0);
  ctx.lineTo(radius * 0.7, radius * 0.7);
  ctx.lineTo(0, radius);
  ctx.lineTo(-radius * 0.8, radius * 0.6);
  ctx.lineTo(-radius, 0);
  ctx.lineTo(-radius * 0.6, -radius * 0.8);
  ctx.lineTo(0, -radius);
  ctx.lineTo(radius * 0.8, -radius * 0.6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crater
  ctx.fillStyle = '#334155';
  ctx.beginPath();
  ctx.arc(-2, -2, radius * 0.3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Renders the ground strip and ground surface texture for each world
 */
export function renderWorldGround(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  groundY: number,
  worldId: WorldId,
  scroll: number
): void {
  const groundHeight = height - groundY;

  ctx.save();

  if (worldId === 'farm') {
    // Farm: Lush green pasture grass
    ctx.fillStyle = '#22c55e';
    ctx.fillRect(0, groundY, width, groundHeight);

    // Deep soil layer
    ctx.fillStyle = '#15803d';
    ctx.fillRect(0, groundY + 14, width, groundHeight - 14);

    // Grass blade border on top
    ctx.fillStyle = '#16a34a';
    ctx.strokeStyle = '#0f172a';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Grass tufts scrolling
    const grassOffset = scroll % 24;
    ctx.fillStyle = '#86efac';
    for (let x = -24; x <= width + 24; x += 24) {
      const gx = x - grassOffset;
      ctx.beginPath();
      ctx.moveTo(gx, groundY);
      ctx.lineTo(gx + 3, groundY - 6);
      ctx.lineTo(gx + 6, groundY);
      ctx.fill();
    }
  } else if (worldId === 'forest') {
    // Forest: Deep mossy earth
    ctx.fillStyle = '#065f46';
    ctx.fillRect(0, groundY, width, groundHeight);

    ctx.fillStyle = '#022c22';
    ctx.fillRect(0, groundY + 14, width, groundHeight - 14);

    // Bioluminescent moss border
    ctx.strokeStyle = '#047857';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // Glowing moss spots
    const mossOffset = scroll % 32;
    ctx.fillStyle = '#34d399';
    for (let x = -32; x <= width + 32; x += 32) {
      const mx = x - mossOffset;
      ctx.beginPath();
      ctx.ellipse(mx, groundY + 4, 8, 3, 0, 0, Math.PI * 2);
      ctx.fill();
    }
  } else if (worldId === 'candy') {
    // Candy: Frosted strawberry cake & wafer layers
    ctx.fillStyle = '#f43f5e';
    ctx.fillRect(0, groundY, width, groundHeight);

    ctx.fillStyle = '#be123c';
    ctx.fillRect(0, groundY + 16, width, groundHeight - 16);

    // White vanilla icing drips on edge
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    const dripOffset = scroll % 40;
    for (let x = -40; x <= width + 40; x += 40) {
      const dx = x - dripOffset;
      ctx.lineTo(dx + 10, groundY);
      ctx.quadraticCurveTo(dx + 20, groundY + 10, dx + 30, groundY);
    }
    ctx.lineTo(width, groundY);
    ctx.lineTo(width, groundY + 6);
    ctx.lineTo(0, groundY + 6);
    ctx.closePath();
    ctx.fill();
  } else if (worldId === 'space') {
    // Space: High-tech floating cosmic platform / lunar plate
    ctx.fillStyle = '#1e1b4b';
    ctx.fillRect(0, groundY, width, groundHeight);

    ctx.fillStyle = '#0f172a';
    ctx.fillRect(0, groundY + 14, width, groundHeight - 14);

    // Neon Cyber Grid line
    ctx.strokeStyle = '#38bdf8';
    ctx.lineWidth = 3;
    ctx.shadowColor = '#0284c7';
    ctx.shadowBlur = 8;
    ctx.beginPath();
    ctx.moveTo(0, groundY);
    ctx.lineTo(width, groundY);
    ctx.stroke();

    // High tech plate seams
    ctx.shadowBlur = 0;
    ctx.strokeStyle = '#4338ca';
    ctx.lineWidth = 2;
    const plateOffset = scroll % 60;
    for (let x = -60; x <= width + 60; x += 60) {
      const px = x - plateOffset;
      ctx.beginPath();
      ctx.moveTo(px, groundY);
      ctx.lineTo(px, groundY + groundHeight);
      ctx.stroke();
    }
  }

  ctx.restore();
}

/**
 * Renders individual obstacles with high contrast outlines, shadows, and distinct world themes
 */
export function renderObstacle(
  ctx: CanvasRenderingContext2D,
  obstacle: Obstacle,
  time: number
): void {
  const { x, y, width, height, worldId, type } = obstacle;

  ctx.save();
  ctx.translate(x, y);

  const OUTLINE = '#0f172a';
  const LINE_WIDTH = 2.5;

  ctx.strokeStyle = OUTLINE;
  ctx.lineWidth = LINE_WIDTH;
  ctx.lineJoin = 'round';
  ctx.lineCap = 'round';

  // Ground shadow beneath obstacle
  ctx.save();
  ctx.fillStyle = 'rgba(15, 23, 42, 0.35)';
  ctx.beginPath();
  ctx.ellipse(width / 2, height + 2, width * 0.55, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.restore();

  switch (worldId) {
    case 'farm':
      drawFarmObstacle(ctx, type, width, height, OUTLINE);
      break;
    case 'forest':
      drawForestObstacle(ctx, type, width, height, time, OUTLINE);
      break;
    case 'candy':
      drawCandyObstacle(ctx, type, width, height, time, OUTLINE);
      break;
    case 'space':
      drawSpaceObstacle(ctx, type, width, height, time, OUTLINE);
      break;
  }

  ctx.restore();
}

/**
 * World 1 Obstacles:
 * - 'crate': Wooden Farm Crate
 * - 'haybale': Round tied Hay Bale
 * - 'rock': Mossy Farm Rock
 * - 'fence': Rustic Wooden Fence Barrier
 */
function drawFarmObstacle(
  ctx: CanvasRenderingContext2D,
  type: string,
  w: number,
  h: number,
  outline: string
) {
  if (type === 'haybale') {
    // Round Golden Hay Bale
    ctx.fillStyle = '#facc15';
    ctx.beginPath();
    ctx.ellipse(w / 2, h / 2, w * 0.48, h * 0.48, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tied rope strings
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(w / 2, h / 2, w * 0.28, 0, Math.PI * 2);
    ctx.stroke();

    // Straw texture lines
    ctx.strokeStyle = '#eab308';
    ctx.lineWidth = 1.5;
    for (let a = 0; a < Math.PI * 2; a += Math.PI / 4) {
      ctx.beginPath();
      ctx.moveTo(w / 2, h / 2);
      ctx.lineTo(w / 2 + Math.cos(a) * (w * 0.45), h / 2 + Math.sin(a) * (h * 0.45));
      ctx.stroke();
    }
  } else if (type === 'rock') {
    // Mossy Farm Boulder
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(w * 0.1, h);
    ctx.quadraticCurveTo(0, h * 0.4, w * 0.3, h * 0.1);
    ctx.quadraticCurveTo(w * 0.7, 0, w * 0.9, h * 0.3);
    ctx.quadraticCurveTo(w, h * 0.7, w * 0.9, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Green moss on top
    ctx.fillStyle = '#4ade80';
    ctx.beginPath();
    ctx.arc(w * 0.45, h * 0.25, 8, 0, Math.PI * 2);
    ctx.arc(w * 0.65, h * 0.28, 7, 0, Math.PI * 2);
    ctx.fill();
  } else {
    // Default 'crate': Wooden Farm Crate with planks & X brace
    ctx.fillStyle = '#d97706';
    ctx.beginPath();
    ctx.rect(0, 0, w, h);
    ctx.fill();
    ctx.stroke();

    // Wood Planks
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(0, h * 0.5);
    ctx.lineTo(w, h * 0.5);
    ctx.stroke();

    // Wooden X brace
    ctx.strokeStyle = '#b45309';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(4, 4);
    ctx.lineTo(w - 4, h - 4);
    ctx.moveTo(w - 4, 4);
    ctx.lineTo(4, h - 4);
    ctx.stroke();
  }
}

/**
 * World 2 Obstacles:
 * - 'log': Ancient Mossy Hollow Log
 * - 'shroom': Giant Spiky Magic Mushroom
 * - 'bramble': Dark Enchanted Thorns
 * - 'crystal': Glowing Mana Crystal Spire
 */
function drawForestObstacle(
  ctx: CanvasRenderingContext2D,
  type: string,
  w: number,
  h: number,
  time: number,
  outline: string
) {
  if (type === 'crystal') {
    // Glowing Crystal Cluster
    const glow = 0.7 + Math.sin(time * 4) * 0.3;
    ctx.fillStyle = `rgba(52, 211, 153, ${glow})`;
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.85, h * 0.7);
    ctx.lineTo(w * 0.7, h);
    ctx.lineTo(w * 0.3, h);
    ctx.lineTo(w * 0.15, h * 0.7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Crystal facet highlight
    ctx.fillStyle = '#a7f3d0';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.5, h);
    ctx.lineTo(w * 0.15, h * 0.7);
    ctx.closePath();
    ctx.fill();
  } else if (type === 'bramble') {
    // Twisted Dark Bramble Thorns
    ctx.fillStyle = '#14532d';
    ctx.beginPath();
    ctx.moveTo(0, h);
    ctx.quadraticCurveTo(w * 0.2, h * 0.3, w * 0.5, 0);
    ctx.quadraticCurveTo(w * 0.8, h * 0.3, w, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sharp thorns
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.moveTo(w * 0.25, h * 0.5);
    ctx.lineTo(w * 0.05, h * 0.45);
    ctx.lineTo(w * 0.3, h * 0.6);
    ctx.moveTo(w * 0.75, h * 0.5);
    ctx.lineTo(w * 0.95, h * 0.45);
    ctx.lineTo(w * 0.7, h * 0.6);
    ctx.fill();
  } else {
    // Default 'log': Mossy Hollow Log
    ctx.fillStyle = '#451a03';
    ctx.beginPath();
    safeRoundRect(ctx, 0, 0, w, h, 6);
    ctx.fill();
    ctx.stroke();

    // Hollow wood rings
    ctx.fillStyle = '#78350f';
    ctx.beginPath();
    ctx.ellipse(w * 0.25, h * 0.5, w * 0.2, h * 0.38, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Glowing mushroom on log
    ctx.fillStyle = '#34d399';
    ctx.beginPath();
    ctx.arc(w * 0.7, 2, 7, Math.PI, 0);
    ctx.fill();
  }
}

/**
 * World 3 Obstacles:
 * - 'candycane': Tall Striped Candy Cane
 * - 'gumdrop': Giant Bouncing Sugar Gumdrop
 * - 'cupcake': Frosted Cupcake Obstacle
 */
function drawCandyObstacle(
  ctx: CanvasRenderingContext2D,
  type: string,
  w: number,
  h: number,
  time: number,
  outline: string
) {
  if (type === 'gumdrop') {
    // Giant translucent jelly gumdrop
    const bounce = Math.sin(time * 6) * 2;
    ctx.fillStyle = '#8b5cf6';
    ctx.beginPath();
    ctx.moveTo(4, h);
    ctx.quadraticCurveTo(2, h * 0.3 + bounce, w / 2, 0 + bounce);
    ctx.quadraticCurveTo(w - 2, h * 0.3 + bounce, w - 4, h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Sugar crystals
    ctx.fillStyle = '#ffffff';
    for (let i = 0; i < 5; i++) {
      ctx.fillRect(8 + i * 6, h * 0.4 + (i % 3) * 6, 2.5, 2.5);
    }
  } else {
    // Default 'candycane': Striped Candy Cane
    ctx.save();
    ctx.lineWidth = 10;
    ctx.strokeStyle = '#ffffff';
    ctx.lineCap = 'round';
    ctx.beginPath();
    ctx.moveTo(w * 0.4, h);
    ctx.lineTo(w * 0.4, 16);
    ctx.arc(w * 0.7, 16, w * 0.3, Math.PI, 0, false);
    ctx.lineTo(w, 24);
    ctx.stroke();

    // Outline
    ctx.strokeStyle = outline;
    ctx.lineWidth = 2.5;
    ctx.stroke();

    // Red spiral stripes
    ctx.strokeStyle = '#ef4444';
    ctx.lineWidth = 6;
    for (let y = h - 6; y >= 20; y -= 16) {
      ctx.beginPath();
      ctx.moveTo(w * 0.25, y);
      ctx.lineTo(w * 0.55, y - 6);
      ctx.stroke();
    }
    ctx.restore();
  }
}

/**
 * World 4 Obstacles:
 * - 'asteroid': Rocky Floating Cratered Asteroid
 * - 'laser': Cybernetic Plasma Laser Barrier
 * - 'satellite': High-tech Space Drone Debris
 */
function drawSpaceObstacle(
  ctx: CanvasRenderingContext2D,
  type: string,
  w: number,
  h: number,
  time: number,
  outline: string
) {
  if (type === 'laser') {
    // Laser Emitter Pylons on top and bottom
    ctx.fillStyle = '#334155';
    ctx.fillRect(w * 0.2, h - 14, w * 0.6, 14);
    ctx.strokeRect(w * 0.2, h - 14, w * 0.6, 14);

    ctx.fillRect(w * 0.2, 0, w * 0.6, 14);
    ctx.strokeRect(w * 0.2, 0, w * 0.6, 14);

    // Glowing Neon Plasma Beam in middle
    const beamPulse = 0.75 + Math.sin(time * 15) * 0.25;
    ctx.strokeStyle = `rgba(56, 189, 248, ${beamPulse})`;
    ctx.lineWidth = 8;
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2, h - 10);
    ctx.stroke();

    // White hot core
    ctx.strokeStyle = '#ffffff';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(w / 2, 10);
    ctx.lineTo(w / 2, h - 10);
    ctx.stroke();
  } else {
    // Default 'asteroid': Cratered Asteroid Rock
    ctx.fillStyle = '#64748b';
    ctx.beginPath();
    ctx.moveTo(w * 0.5, 0);
    ctx.lineTo(w * 0.9, h * 0.2);
    ctx.lineTo(w, h * 0.7);
    ctx.lineTo(w * 0.6, h);
    ctx.lineTo(w * 0.1, h * 0.85);
    ctx.lineTo(0, h * 0.35);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Deep craters
    ctx.fillStyle = '#334155';
    ctx.beginPath();
    ctx.arc(w * 0.4, h * 0.4, 6, 0, Math.PI * 2);
    ctx.arc(w * 0.7, h * 0.65, 5, 0, Math.PI * 2);
    ctx.fill();
  }
}

/**
 * Renders immersive near-camera foreground parallax elements (1.25x - 1.45x speed)
 * that fly in front of the runway and hurdles, creating dynamic 3D stereoscopic depth.
 */
export function renderWorldForeground(
  ctx: CanvasRenderingContext2D,
  opts: WorldRenderContext
): void {
  const { width, groundY, worldId, scrollOffset, time } = opts;
  ctx.save();

  if (worldId === 'farm') {
    // Farm: Roadside grass blades speeding past bottom edge at 1.25x scroll
    const fgGrassOffset = (scrollOffset * 1.25) % 24;
    ctx.fillStyle = '#15803d';
    for (let x = -24; x <= width + 24; x += 24) {
      const gx = x - fgGrassOffset;
      ctx.beginPath();
      ctx.moveTo(gx, groundY + 12);
      ctx.lineTo(gx + 4, groundY - 12);
      ctx.lineTo(gx + 8, groundY + 12);
      ctx.fill();
    }
    // Drifting close dandelion seeds flying fast at 1.35x
    for (let i = 0; i < 5; i++) {
      const dx = ((i * 180 - scrollOffset * 1.35 + Math.sin(time * 3 + i) * 30) % (width + 60) + width + 60) % (width + 60) - 30;
      const dy = groundY - 20 - ((i * 45 + time * 35) % 150);
      ctx.save();
      ctx.fillStyle = 'rgba(255, 255, 255, 0.75)';
      ctx.beginPath();
      ctx.arc(dx, dy, 2.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(254, 240, 138, 0.6)';
      ctx.lineWidth = 1;
      ctx.beginPath();
      ctx.moveTo(dx, dy);
      ctx.lineTo(dx + 3, dy - 4);
      ctx.stroke();
      ctx.restore();
    }
  } else if (worldId === 'forest') {
    // Forest: Floating luminescent fairy spore particles flying close (1.3x)
    for (let i = 0; i < 6; i++) {
      const fx = ((i * 140 - scrollOffset * 1.3) % (width + 40) + width + 40) % (width + 40) - 20;
      const fy = groundY - 10 - ((i * 38 + time * 30) % 170);
      const pulse = 0.5 + Math.sin(time * 6 + i) * 0.4;
      ctx.save();
      ctx.fillStyle = `rgba(52, 211, 153, ${pulse})`;
      ctx.beginPath();
      ctx.arc(fx, fy, 3.5, 0, Math.PI * 2);
      ctx.fill();
      ctx.restore();
    }
  } else if (worldId === 'candy') {
    // Candy: Whirling sugar confetti & glitter sparkles (1.3x)
    for (let i = 0; i < 7; i++) {
      const sx = ((i * 120 - scrollOffset * 1.3) % (width + 40) + width + 40) % (width + 40) - 20;
      const sy = groundY - 20 - ((i * 40 + time * 45) % 180);
      ctx.save();
      ctx.translate(sx, sy);
      ctx.rotate(time * 4 + i);
      ctx.fillStyle = ['#f472b6', '#38bdf8', '#facc15', '#a855f7'][i % 4];
      ctx.fillRect(-3, -2, 6, 4);
      ctx.restore();
    }
  } else if (worldId === 'space') {
    // Space: High-speed cyan warp streaks and cosmic dust flying past lens (1.45x)
    for (let i = 0; i < 6; i++) {
      const wx = ((i * 160 - scrollOffset * 1.45) % (width + 100) + width + 100) % (width + 100) - 50;
      const wy = 40 + (i * 55) % (groundY - 60);
      ctx.save();
      ctx.strokeStyle = i % 2 === 0 ? 'rgba(56, 189, 248, 0.85)' : 'rgba(216, 180, 254, 0.7)';
      ctx.lineWidth = 2.5;
      ctx.beginPath();
      ctx.moveTo(wx, wy);
      ctx.lineTo(wx + 22, wy);
      ctx.stroke();
      ctx.restore();
    }
  }

  ctx.restore();
}
