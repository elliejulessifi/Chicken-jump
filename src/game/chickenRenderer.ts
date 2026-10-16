import { CostumeId, ChickenExpression } from './types.ts';

export interface ChickenRenderOptions {
  x: number;
  y: number;
  width: number;
  height: number;
  costume: CostumeId;
  expression: ChickenExpression;
  isJumping: boolean;
  jumpProgress: number; // 0 to 1
  runCycle: number; // continuous time or frame counter
  isGrounded: boolean;
  scale?: number;
  showShadow?: boolean;
  groundY?: number;
}

/**
 * Universal safe rounded rectangle helper compatible with all browsers and canvas engines
 */
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
 * Draws the signature cartoon chicken with high-contrast outlines,
 * dynamic expressions, animated running/jumping cycle, and costume overlays.
 */
export function drawChicken(ctx: CanvasRenderingContext2D, opts: ChickenRenderOptions): void {
  const {
    x,
    y,
    width,
    height,
    costume,
    expression,
    isJumping,
    runCycle,
    isGrounded,
    scale = 1,
    showShadow = true,
    groundY = y + height,
  } = opts;

  ctx.save();
  ctx.translate(x + width / 2, y + height / 2);
  ctx.scale(scale, scale);

  // Bobbing and tilt calculations
  const runBob = isGrounded ? Math.sin(runCycle * 14) * 3 : 0;
  const runTilt = isGrounded ? Math.sin(runCycle * 7) * 0.05 : (isJumping ? -0.1 : 0.08);

  // Expression-based offset / shake
  let exprShakeX = 0;
  let exprShakeY = 0;
  if (expression === 'surprised') {
    exprShakeX = Math.sin(runCycle * 30) * 2;
    exprShakeY = -4; // jumps slightly in shock
  } else if (expression === 'dizzy') {
    exprShakeX = Math.sin(runCycle * 6) * 3;
    exprShakeY = 4; // slumps down
  } else if (expression === 'celebrating') {
    exprShakeY = Math.abs(Math.sin(runCycle * 12)) * -6; // bounces with joy
  }

  // Draw ground shadow if chicken is above ground
  if (showShadow) {
    const distToGround = Math.max(0, groundY - (y + height));
    const shadowScale = Math.max(0.3, 1 - distToGround / 220);
    const shadowAlpha = Math.max(0.12, 0.35 - distToGround / 350);

    ctx.save();
    // revert translation to ground level
    ctx.translate(0, height / 2 + distToGround);
    ctx.scale(shadowScale, shadowScale * 0.4);
    ctx.beginPath();
    ctx.arc(0, 0, width * 0.45, 0, Math.PI * 2);
    ctx.fillStyle = `rgba(15, 23, 42, ${shadowAlpha})`;
    ctx.fill();
    ctx.restore();
  }

  // Apply chicken center offset
  ctx.translate(exprShakeX, runBob + exprShakeY);
  ctx.rotate(runTilt + (expression === 'dizzy' ? 0.2 : 0));

  const OUTLINE_COLOR = '#0f172a';
  const OUTLINE_WIDTH = 2.8;

  // 1. BACK COSTUME ACCESSORIES (e.g. Cape, Space Thruster)
  if (costume === 'superhero') {
    drawSuperheroCape(ctx, runCycle, isJumping);
  } else if (costume === 'space') {
    drawSpaceBackpack(ctx, runCycle);
  }

  // 2. ORANGE FEET (Running animation cycle)
  drawFeet(ctx, runCycle, isGrounded, isJumping, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 3. FLUFFY TAIL FEATHERS
  drawTailFeathers(ctx, runCycle, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 4. MAIN FLUFFY WHITE BODY
  drawBody(ctx, costume, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 5. RED COMB (Top of head)
  drawComb(ctx, runCycle, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 6. RED WATTLE & ORANGE BEAK
  drawBeakAndWattle(ctx, expression, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 7. EXPRESSIVE EYES
  drawEyes(ctx, expression, runCycle, OUTLINE_COLOR);

  // 8. FLUFFY WINGS (Animated flap/rest)
  drawWing(ctx, costume, runCycle, isJumping, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 9. COSTUME OVERLAYS & HEADPIECES
  drawCostumeOverlays(ctx, costume, expression, runCycle, OUTLINE_COLOR, OUTLINE_WIDTH);

  // 10. EXTRA CELEBRATION / DIZZY / SURPRISE PARTICLES
  drawExpressionVFX(ctx, expression, runCycle);

  ctx.restore();
}

/**
 * Feet with lively alternating running cycle and tucked jump position
 */
function drawFeet(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  isGrounded: boolean,
  isJumping: boolean,
  outlineColor: string,
  lineWidth: number
) {
  const leftLegAngle = isGrounded ? Math.sin(cycle * 14) * 0.5 : (isJumping ? 0.3 : 0.1);
  const rightLegAngle = isGrounded ? Math.sin(cycle * 14 + Math.PI) * 0.5 : (isJumping ? -0.2 : 0.1);

  const footY = 16;
  const footColor = '#f97316';
  const footOutline = outlineColor;

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = footOutline;
  ctx.fillStyle = footColor;
  ctx.lineCap = 'round';
  ctx.lineJoin = 'round';

  // Left Foot (Back leg)
  ctx.save();
  ctx.translate(-7, footY);
  ctx.rotate(leftLegAngle);
  // Leg
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 9);
  ctx.stroke();
  // Toes
  ctx.beginPath();
  ctx.ellipse(3, 9, 7, 3.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Right Foot (Front leg)
  ctx.save();
  ctx.translate(8, footY);
  ctx.rotate(rightLegAngle);
  // Leg
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(0, 9);
  ctx.stroke();
  // Toes
  ctx.beginPath();
  ctx.ellipse(4, 9, 7.5, 3.5, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}

/**
 * Fluffy tail tuft
 */
function drawTailFeathers(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  const tailWiggle = Math.sin(cycle * 10) * 0.1;
  ctx.save();
  ctx.translate(-24, 2);
  ctx.rotate(tailWiggle);

  ctx.fillStyle = '#ffffff';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';

  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(-14, -8, -18, -16);
  ctx.quadraticCurveTo(-8, -14, -6, -8);
  ctx.quadraticCurveTo(-16, -2, -18, 6);
  ctx.quadraticCurveTo(-8, 3, 0, 4);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Main chicken body: rounded cute plump egg-shaped silhouette
 */
function drawBody(
  ctx: CanvasRenderingContext2D,
  costume: CostumeId,
  outlineColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';

  // Body gradient for smooth soft plumpness
  const grad = ctx.createRadialGradient(-4, -6, 6, 0, 0, 28);
  grad.addColorStop(0, '#ffffff');
  grad.addColorStop(0.85, '#f8fafc');
  grad.addColorStop(1, '#e2e8f0');

  ctx.fillStyle = grad;

  ctx.beginPath();
  // Cute pear/egg shape for the chicken body
  ctx.ellipse(0, 0, 24, 21, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Fluffy belly detail
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(4, 3, 17, 14, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Space suit body overlay if space costume
  if (costume === 'space') {
    ctx.fillStyle = '#38bdf8';
    ctx.beginPath();
    safeRoundRect(ctx, -8, 2, 16, 12, 3);
    ctx.fill();
    ctx.stroke();

    // Chest buttons / tech indicator
    ctx.fillStyle = '#ef4444';
    ctx.beginPath();
    ctx.arc(-3, 8, 2, 0, Math.PI * 2);
    ctx.fill();

    ctx.fillStyle = '#22c55e';
    ctx.beginPath();
    ctx.arc(3, 8, 2, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Classic 3-tiered red chicken comb
 */
function drawComb(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  const combBob = Math.sin(cycle * 12) * 1.5;
  ctx.save();
  ctx.translate(2, -20 + combBob);

  ctx.fillStyle = '#ef4444';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.lineJoin = 'round';

  // Three round puffs of comb
  ctx.beginPath();
  // Puff 1
  ctx.arc(-8, 2, 6.5, 0, Math.PI * 2);
  // Puff 2 (tallest center)
  ctx.arc(0, -3, 8, 0, Math.PI * 2);
  // Puff 3 (front)
  ctx.arc(8, 0, 6, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Highlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.4)';
  ctx.beginPath();
  ctx.arc(-1, -6, 3, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Beak and cute little red wattle
 */
function drawBeakAndWattle(
  ctx: CanvasRenderingContext2D,
  expression: ChickenExpression,
  outlineColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';

  // Red wattle under beak
  ctx.fillStyle = '#dc2626';
  ctx.beginPath();
  ctx.ellipse(13, 8, 4, 6.5, 0.2, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Orange beak
  ctx.fillStyle = '#f97316';

  if (expression === 'surprised' || expression === 'celebrating') {
    // Open beak in gasp or cheer!
    ctx.beginPath();
    ctx.moveTo(11, -2);
    ctx.lineTo(24, 2);
    ctx.lineTo(13, 3);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Open mouth inside
    ctx.fillStyle = '#991b1b';
    ctx.beginPath();
    ctx.ellipse(14, 3, 3, 2, 0, 0, Math.PI * 2);
    ctx.fill();

    // Lower beak
    ctx.fillStyle = '#ea580c';
    ctx.beginPath();
    ctx.moveTo(12, 3);
    ctx.lineTo(22, 6);
    ctx.lineTo(13, 7);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
  } else {
    // Standard cute pointed beak
    ctx.beginPath();
    ctx.moveTo(11, -3);
    ctx.lineTo(25, 2);
    ctx.lineTo(12, 6);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();

    // Beak shine
    ctx.fillStyle = 'rgba(255, 255, 255, 0.5)';
    ctx.beginPath();
    ctx.moveTo(13, -1);
    ctx.lineTo(19, 1);
    ctx.lineTo(14, 2);
    ctx.closePath();
    ctx.fill();
  }

  ctx.restore();
}

/**
 * Expressive Eyes based on state:
 * - Happy (cheerful crescent smiling eyes or big glossy pupils)
 * - Determined (slant brow, laser focus)
 * - Surprised (wide whites, tiny pupils, sweat drop)
 * - Dizzy (swirling spiral or 'X' eyes)
 * - Celebrating (starry pupils or joyful super-happy curved arcs)
 */
function drawEyes(
  ctx: CanvasRenderingContext2D,
  expression: ChickenExpression,
  cycle: number,
  outlineColor: string
) {
  const eyeX = 6;
  const eyeY = -7;

  ctx.save();

  if (expression === 'happy') {
    // Big cheerful cartoon eye with bright reflection
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 7.5, 9, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Big pupil looking forward/up
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(eyeX + 2, eyeY, 4.5, 6, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight sparkles
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 3.5, eyeY - 2.5, 2.2, 0, Math.PI * 2);
    ctx.fill();
    ctx.beginPath();
    ctx.arc(eyeX + 1.2, eyeY + 2.5, 1.2, 0, Math.PI * 2);
    ctx.fill();

    // Cheerful lifted brow
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 11, 6, 0.8 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  } else if (expression === 'determined') {
    // Focused slanted brow, intense jump look
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 7.5, 8.5, 0.05, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Pupil looking forward
    ctx.fillStyle = '#1e293b';
    ctx.beginPath();
    ctx.ellipse(eyeX + 3, eyeY, 4.5, 5.5, 0.05, 0, Math.PI * 2);
    ctx.fill();

    // Catchlight
    ctx.fillStyle = '#ffffff';
    ctx.beginPath();
    ctx.arc(eyeX + 4.5, eyeY - 1.5, 2, 0, Math.PI * 2);
    ctx.fill();

    // Determined angled eyebrow mask cutting top of eye
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.6;
    ctx.beginPath();
    ctx.moveTo(eyeX - 8, eyeY - 8);
    ctx.lineTo(eyeX + 9, eyeY - 3);
    ctx.stroke();
  } else if (expression === 'surprised') {
    // HUGE wide eye, tiny startled pinprick pupil!
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.5;
    ctx.beginPath();
    ctx.arc(eyeX, eyeY, 9.5, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Tiny contracted pupil
    ctx.fillStyle = '#0f172a';
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY, 2.4, 0, Math.PI * 2);
    ctx.fill();

    // High shocked arched brow
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 13, 7, 0.8 * Math.PI, 1.9 * Math.PI);
    ctx.stroke();

    // Blue sweat drop flying off
    ctx.fillStyle = '#38bdf8';
    ctx.strokeStyle = '#0284c7';
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(eyeX - 12, eyeY - 10);
    ctx.quadraticCurveTo(eyeX - 16, eyeY - 16, eyeX - 14, eyeY - 20);
    ctx.quadraticCurveTo(eyeX - 10, eyeY - 16, eyeX - 12, eyeY - 10);
    ctx.fill();
    ctx.stroke();
  } else if (expression === 'dizzy') {
    // Comical spiraling / X eyes
    ctx.fillStyle = '#f8fafc';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 8, 8, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Spiral in center
    ctx.strokeStyle = '#64748b';
    ctx.lineWidth = 2;
    ctx.beginPath();
    const spiralAngle = cycle * 8;
    for (let r = 1; r < 5.5; r += 0.5) {
      const a = spiralAngle + r * 1.8;
      const sx = eyeX + Math.cos(a) * r;
      const sy = eyeY + Math.sin(a) * r;
      if (r === 1) ctx.moveTo(sx, sy);
      else ctx.lineTo(sx, sy);
    }
    ctx.stroke();
  } else if (expression === 'celebrating') {
    // Starry eyes / super joyful closed eyes!
    ctx.fillStyle = '#ffffff';
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2.2;
    ctx.beginPath();
    ctx.ellipse(eyeX, eyeY, 8, 8.5, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.stroke();

    // Golden star pupil!
    drawStar(ctx, eyeX + 1.5, eyeY, 5, 5, 2.2, '#f59e0b');

    // Cheerful happy eyebrow
    ctx.strokeStyle = outlineColor;
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.arc(eyeX + 1, eyeY - 11, 6, 0.8 * Math.PI, 1.8 * Math.PI);
    ctx.stroke();
  }

  ctx.restore();
}

/**
 * Fluffy wing with flap animation during jumps
 */
function drawWing(
  ctx: CanvasRenderingContext2D,
  costume: CostumeId,
  cycle: number,
  isJumping: boolean,
  outlineColor: string,
  lineWidth: number
) {
  const flapAngle = isJumping ? Math.sin(cycle * 22) * 0.45 - 0.2 : Math.sin(cycle * 12) * 0.1;
  ctx.save();
  ctx.translate(-7, 2);
  ctx.rotate(flapAngle);

  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';

  ctx.fillStyle = '#f1f5f9';

  ctx.beginPath();
  // Cute rounded feathered wing
  ctx.moveTo(0, 0);
  ctx.quadraticCurveTo(14, 2, 17, 10);
  ctx.quadraticCurveTo(10, 14, 2, 13);
  ctx.quadraticCurveTo(-10, 12, -8, 2);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Wing feather crease details
  ctx.strokeStyle = '#cbd5e1';
  ctx.lineWidth = 1.8;
  ctx.beginPath();
  ctx.moveTo(3, 4);
  ctx.quadraticCurveTo(8, 7, 12, 9);
  ctx.moveTo(-1, 6);
  ctx.quadraticCurveTo(4, 9, 7, 11);
  ctx.stroke();

  ctx.restore();
}

/**
 * Renders all costume-specific overlays (Crown, Sunglasses, Mask, Headphones, Space Helmet)
 */
function drawCostumeOverlays(
  ctx: CanvasRenderingContext2D,
  costume: CostumeId,
  expression: ChickenExpression,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  ctx.lineWidth = lineWidth;
  ctx.strokeStyle = outlineColor;
  ctx.lineJoin = 'round';

  // 1. SIGNATURE PURPLE HEADPHONES (Equipped on Original Chicken and also stylish on others if not overridden)
  if (costume === 'original') {
    drawSignaturePurpleHeadphones(ctx, cycle, outlineColor, lineWidth);
  }

  // 2. SUPERHERO MASK
  if (costume === 'superhero') {
    drawSuperheroMask(ctx, outlineColor, lineWidth);
  }

  // 3. ROYAL CROWN & MANTLE
  if (costume === 'royal') {
    drawRoyalCrownAndMantle(ctx, cycle, outlineColor, lineWidth);
  }

  // 4. COOL SUNGLASSES & GOLD CHAIN
  if (costume === 'cool') {
    drawCoolShadesAndChain(ctx, outlineColor, lineWidth);
  }

  // 5. SPACE HELMET & VISOR
  if (costume === 'space') {
    drawSpaceHelmet(ctx, cycle, outlineColor, lineWidth);
  }
}

/**
 * Signature Purple Headphones
 */
function drawSignaturePurpleHeadphones(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  const hpBounce = Math.sin(cycle * 12) * 1;
  ctx.save();
  ctx.translate(0, -6 + hpBounce);

  // Metallic Headband arch
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth + 1;
  ctx.beginPath();
  ctx.arc(0, -10, 19, 1.1 * Math.PI, 1.85 * Math.PI);
  ctx.stroke();

  // Chrome inner band
  ctx.strokeStyle = '#94a3b8';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  ctx.arc(0, -10, 19, 1.15 * Math.PI, 1.8 * Math.PI);
  ctx.stroke();

  // Earcup 1: Front visible over-ear headphone (Signature Purple / Violet)
  const earcupX = -2;
  const earcupY = -4;

  // Outer purple cup
  ctx.fillStyle = '#7c3aed'; // Deep vibrant violet
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(earcupX, earcupY, 9, 12, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Magenta cushion pad
  ctx.fillStyle = '#a855f7';
  ctx.beginPath();
  ctx.ellipse(earcupX, earcupY, 6.5, 9.5, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Metallic central ring / Beats-like logo ring
  ctx.fillStyle = '#ede9fe';
  ctx.beginPath();
  ctx.arc(earcupX, earcupY, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Music beat wave glow
  ctx.strokeStyle = 'rgba(192, 132, 252, 0.6)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(earcupX - 10, earcupY - 2, 5 + Math.sin(cycle * 15) * 2, 0.8 * Math.PI, 1.2 * Math.PI);
  ctx.stroke();

  ctx.restore();
}

/**
 * Superhero Cape & Mask
 */
function drawSuperheroCape(ctx: CanvasRenderingContext2D, cycle: number, isJumping: boolean) {
  const capeWave = Math.sin(cycle * 16) * 6;
  ctx.save();
  ctx.translate(-16, -2);

  ctx.fillStyle = '#dc2626';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;

  ctx.beginPath();
  ctx.moveTo(4, 0);
  ctx.lineTo(-24, 8 + capeWave);
  ctx.quadraticCurveTo(-18, 18 + capeWave, -22, 28);
  ctx.lineTo(6, 12);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Cape gold lining
  ctx.strokeStyle = '#facc15';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-24, 8 + capeWave);
  ctx.lineTo(-22, 28);
  ctx.stroke();

  ctx.restore();
}

function drawSuperheroMask(
  ctx: CanvasRenderingContext2D,
  outlineColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.translate(6, -8);

  // Black / dark blue superhero domino mask
  ctx.fillStyle = '#1e3a8a';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.ellipse(0, 0, 11, 7, 0.1, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Eye cutouts
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(2, 0, 5, 4, 0.1, 0, Math.PI * 2);
  ctx.fill();

  // Pupil looking forward
  ctx.fillStyle = '#0f172a';
  ctx.beginPath();
  ctx.arc(3.5, 0, 2.5, 0, Math.PI * 2);
  ctx.fill();

  // Superhero golden lightning star on chest
  ctx.fillStyle = '#eab308';
  drawStar(ctx, -4, 15, 4, 5, 2, '#eab308');

  ctx.restore();
}

/**
 * Royal Crown and Ermine Mantle
 */
function drawRoyalCrownAndMantle(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  // Royal Ermine Collar
  ctx.save();
  ctx.translate(0, 10);
  ctx.fillStyle = '#991b1b'; // Imperial red velvet
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;
  ctx.beginPath();
  ctx.ellipse(0, 0, 18, 7, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // White fur trim
  ctx.fillStyle = '#ffffff';
  ctx.beginPath();
  ctx.ellipse(0, 3, 16, 4, 0, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Golden gem clasp
  ctx.fillStyle = '#facc15';
  ctx.beginPath();
  ctx.arc(5, 3, 3, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Golden Jeweled Crown on head
  ctx.save();
  ctx.translate(2, -26);
  ctx.fillStyle = '#eab308';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;

  ctx.beginPath();
  ctx.moveTo(-11, 6);
  ctx.lineTo(-11, -4);
  ctx.lineTo(-5, 0);
  ctx.lineTo(0, -8); // Center peak
  ctx.lineTo(5, 0);
  ctx.lineTo(11, -4);
  ctx.lineTo(11, 6);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();

  // Crown jewels
  ctx.fillStyle = '#ef4444'; // Ruby center
  ctx.beginPath();
  ctx.arc(0, -1, 2.2, 0, Math.PI * 2);
  ctx.fill();

  ctx.fillStyle = '#10b981'; // Emeralds sides
  ctx.beginPath();
  ctx.arc(-6, 2, 1.8, 0, Math.PI * 2);
  ctx.arc(6, 2, 1.8, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/**
 * Cool Sunglasses and Gold Chain
 */
function drawCoolShadesAndChain(
  ctx: CanvasRenderingContext2D,
  outlineColor: string,
  lineWidth: number
) {
  // Gold Bling Chain
  ctx.save();
  ctx.translate(0, 10);
  ctx.strokeStyle = '#eab308';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, -2, 14, 0.2 * Math.PI, 0.8 * Math.PI);
  ctx.stroke();

  // Gold Dollar / Chicken medallion
  ctx.fillStyle = '#facc15';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(4, 9, 4.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();
  ctx.restore();

  // Dark Stylish Sunglasses
  ctx.save();
  ctx.translate(7, -8);
  ctx.fillStyle = '#0f172a';
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = lineWidth;

  // Aviator / Wayfarer lens shape
  ctx.beginPath();
  safeRoundRect(ctx, -4, -4, 15, 10, 3);
  ctx.fill();
  ctx.stroke();

  // Cool diagonal lens glare reflection
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.6)';
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-1, 4);
  ctx.lineTo(7, -3);
  ctx.moveTo(3, 4);
  ctx.lineTo(9, -1);
  ctx.stroke();

  // Glass bridge & temple
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-4, -1);
  ctx.lineTo(-12, -2);
  ctx.stroke();

  ctx.restore();
}

/**
 * Space Chicken Helmet & Thruster Backpack
 */
function drawSpaceBackpack(ctx: CanvasRenderingContext2D, cycle: number) {
  ctx.save();
  ctx.translate(-22, -2);

  // Oxygen tank / Thruster
  ctx.fillStyle = '#64748b';
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 2.5;
  ctx.beginPath();
  safeRoundRect(ctx, -6, -8, 12, 22, 4);
  ctx.fill();
  ctx.stroke();

  // Thruster blue flame puff
  const flameLength = 6 + Math.sin(cycle * 20) * 4;
  ctx.fillStyle = '#38bdf8';
  ctx.beginPath();
  ctx.moveTo(-3, 14);
  ctx.lineTo(0, 14 + flameLength);
  ctx.lineTo(3, 14);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}

function drawSpaceHelmet(
  ctx: CanvasRenderingContext2D,
  cycle: number,
  outlineColor: string,
  lineWidth: number
) {
  ctx.save();
  ctx.translate(4, -9);

  // Glass Astronaut Bubble Helmet with subtle gradient
  const grad = ctx.createRadialGradient(-4, -6, 2, 0, 0, 24);
  grad.addColorStop(0, 'rgba(224, 242, 254, 0.35)');
  grad.addColorStop(0.8, 'rgba(56, 189, 248, 0.25)');
  grad.addColorStop(1, 'rgba(14, 165, 233, 0.45)');

  ctx.fillStyle = grad;
  ctx.strokeStyle = '#0284c7';
  ctx.lineWidth = 2.8;

  ctx.beginPath();
  ctx.arc(0, 0, 22, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  // Helmet glass curved highlight
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(0, 0, 18, 1.1 * Math.PI, 1.45 * Math.PI);
  ctx.stroke();

  // Cyber tech antenna
  ctx.strokeStyle = outlineColor;
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(-14, -14);
  ctx.lineTo(-20, -22);
  ctx.stroke();

  // Pulsing cyan beacon
  ctx.fillStyle = '#06b6d4';
  ctx.beginPath();
  ctx.arc(-20, -22, 3.5, 0, Math.PI * 2);
  ctx.fill();
  ctx.stroke();

  ctx.restore();
}

/**
 * Expression VFX (Floating dizzy stars, shocked sweat, golden celebration sparkles)
 */
function drawExpressionVFX(
  ctx: CanvasRenderingContext2D,
  expression: ChickenExpression,
  cycle: number
) {
  if (expression === 'dizzy') {
    // 3 little yellow stars orbiting head
    for (let i = 0; i < 3; i++) {
      const angle = cycle * 6 + (i * Math.PI * 2) / 3;
      const sx = Math.cos(angle) * 22;
      const sy = -28 + Math.sin(angle) * 8;
      drawStar(ctx, sx, sy, 4, 4, 1.8, '#facc15');
    }
  } else if (expression === 'celebrating') {
    // Joyful golden stars & sparkles
    for (let i = 0; i < 4; i++) {
      const angle = cycle * 4 + (i * Math.PI) / 2;
      const sx = Math.cos(angle) * 26;
      const sy = -22 + Math.sin(angle) * 14;
      drawStar(ctx, sx, sy, 4, 4, 1.8, i % 2 === 0 ? '#f59e0b' : '#38bdf8');
    }
  }
}

/**
 * Utility: Draw a 4 or 5-pointed star
 */
function drawStar(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  spikes: number,
  outerRadius: number,
  innerRadius: number,
  color: string
) {
  let rot = (Math.PI / 2) * 3;
  let x = cx;
  let y = cy;
  const step = Math.PI / spikes;

  ctx.save();
  ctx.fillStyle = color;
  ctx.strokeStyle = '#0f172a';
  ctx.lineWidth = 1.2;
  ctx.beginPath();
  ctx.moveTo(cx, cy - outerRadius);

  for (let i = 0; i < spikes; i++) {
    x = cx + Math.cos(rot) * outerRadius;
    y = cy + Math.sin(rot) * outerRadius;
    ctx.lineTo(x, y);
    rot += step;

    x = cx + Math.cos(rot) * innerRadius;
    y = cy + Math.sin(rot) * innerRadius;
    ctx.lineTo(x, y);
    rot += step;
  }
  ctx.lineTo(cx, cy - outerRadius);
  ctx.closePath();
  ctx.fill();
  ctx.stroke();
  ctx.restore();
}
