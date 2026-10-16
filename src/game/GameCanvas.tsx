import React, { useEffect, useRef, useState, useCallback } from 'react';
import {
  CostumeId,
  WorldId,
  ChickenExpression,
  Obstacle,
  FloatingText,
  Particle,
  PlayerProgress,
  WORLDS,
  COSTUMES
} from './types.ts';
import { drawChicken } from './chickenRenderer.ts';
import { renderWorldBackground, renderWorldGround, renderObstacle, renderWorldForeground } from './worldRenderer.ts';
import { sound } from './audio.ts';
import { unlockNewItems, saveProgress } from './storage.ts';

interface GameCanvasProps {
  progress: PlayerProgress;
  onUpdateProgress: (progress: PlayerProgress) => void;
  onGameOver: (result: {
    finalScore: number;
    bestScore: number;
    isNewBest: boolean;
    newUnlockedCostumes: CostumeId[];
    newUnlockedWorlds: WorldId[];
  }) => void;
  isPaused: boolean;
  onScoreUpdate: (score: number, bestScore: number) => void;
  onWorldChange: (worldId: WorldId) => void;
  setTransitionMessage: (msg: string | null) => void;
  setNearMissNotification: (msg: string | null) => void;
}

export const GameCanvas: React.FC<GameCanvasProps> = ({
  progress,
  onUpdateProgress,
  onGameOver,
  isPaused,
  onScoreUpdate,
  onWorldChange,
  setTransitionMessage,
  setNearMissNotification,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Active game world state
  const gameStateRef = useRef({
    // Chicken
    chicken: {
      x: 95,
      y: 0,
      width: 52,
      height: 52,
      vy: 0,
      isGrounded: false,
      jumpsLeft: 2,
      expression: 'happy' as ChickenExpression,
      expressionEndTime: 0,
      invulnerableUntil: 0,
    },
    currentWorldId: progress.selectedWorld,
    costume: progress.selectedCostume,
    score: 0,
    bestScore: progress.bestScore,
    isNewRecordCelebrated: false,
    obstacles: [] as Obstacle[],
    particles: [] as Particle[],
    floatingTexts: [] as FloatingText[],
    scrollOffset: 0,
    baseSpeed: 6.8,
    speed: 6.8,
    nextObstacleDistance: 480,
    distanceSinceLastObstacle: 0,
    obstacleIdCounter: 1,
    floatingTextCounter: 1,
    time: 0,
    isDead: false,
  });

  // Track prop changes
  useEffect(() => {
    gameStateRef.current.costume = progress.selectedCostume;
  }, [progress.selectedCostume]);

  // Stable refs for callbacks to prevent game loop resets
  const onScoreUpdateRef = useRef(onScoreUpdate);
  onScoreUpdateRef.current = onScoreUpdate;
  const onGameOverRef = useRef(onGameOver);
  onGameOverRef.current = onGameOver;
  const onWorldChangeRef = useRef(onWorldChange);
  onWorldChangeRef.current = onWorldChange;
  const onUpdateProgressRef = useRef(onUpdateProgress);
  onUpdateProgressRef.current = onUpdateProgress;
  const setTransitionMessageRef = useRef(setTransitionMessage);
  setTransitionMessageRef.current = setTransitionMessage;
  const setNearMissNotificationRef = useRef(setNearMissNotification);
  setNearMissNotificationRef.current = setNearMissNotification;
  const isPausedRef = useRef(isPaused);
  isPausedRef.current = isPaused;

  const hasJumpedRef = useRef<boolean>(false);
  const lastJumpTimeRef = useRef<number>(0);

  const performJump = useCallback(() => {
    const now = performance.now();
    // Debounce rapid duplicate events
    if (now - lastJumpTimeRef.current < 90) return;
    lastJumpTimeRef.current = now;

    const s = gameStateRef.current;
    if (s.isDead || isPausedRef.current) return;

    if (s.chicken.jumpsLeft > 0) {
      hasJumpedRef.current = true;
      if (s.chicken.jumpsLeft === 2) {
        // High, soaring First Jump with floaty hang-time (-19.5)
        s.chicken.vy = -19.5;
        s.chicken.isGrounded = false;
        s.chicken.jumpsLeft = 1;
        sound.playJump();
      } else {
        // Super high Double Jump for extreme clearance & recovery (-17.5)
        s.chicken.vy = -17.5;
        s.chicken.jumpsLeft = 0;
        sound.playDoubleJump();

        // Spawn fun little puff of air particles under feet
        for (let i = 0; i < 8; i++) {
          s.particles.push({
            x: s.chicken.x + 25 + (Math.random() - 0.5) * 20,
            y: s.chicken.y + s.chicken.height + 4,
            vx: (Math.random() - 0.5) * 4,
            vy: Math.random() * 3 + 1,
            size: Math.random() * 4 + 2,
            color: '#f8fafc',
            alpha: 0.8,
            life: 0.35,
            maxLife: 0.35,
            type: 'dust',
          });
        }
      }

      // If not in a higher priority expression, set to 'determined'
      if (s.chicken.expression !== 'celebrating') {
        s.chicken.expression = 'determined';
        s.chicken.expressionEndTime = performance.now() + 850;
      }
    }
  }, []);

  // Expose jump handler for keyboard and touch/click anywhere on screen
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.code === 'Space' || e.code === 'ArrowUp' || e.code === 'KeyW') {
        e.preventDefault();
        performJump();
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      const target = e.target as HTMLElement | null;
      // Do not trigger jump if tapping HUD buttons, settings, or modals
      if (target?.closest('button') || target?.closest('[role="dialog"]') || isPausedRef.current) return;
      performJump();
    };

    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('pointerdown', handlePointerDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('pointerdown', handlePointerDown);
    };
  }, [performJump]);

  // Main Canvas Game Loop
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Reset game state for a fresh run
    const s = gameStateRef.current;
    s.currentWorldId = progress.selectedWorld;
    s.costume = progress.selectedCostume;
    s.score = 0;
    s.bestScore = progress.bestScore;
    s.isNewRecordCelebrated = false;
    s.obstacles = [];
    s.particles = [];
    s.floatingTexts = [];
    s.scrollOffset = 0;
    s.baseSpeed = 6.8;
    s.speed = 6.8;
    s.distanceSinceLastObstacle = 0;
    s.nextObstacleDistance = 480;
    s.chicken.x = 95;
    s.isDead = false;
    s.chicken.vy = 0;
    s.chicken.jumpsLeft = 2;
    s.chicken.expression = 'happy';
    s.chicken.expressionEndTime = 0;
    s.chicken.invulnerableUntil = performance.now() + 800; // brief grace period

    onScoreUpdate(0, progress.bestScore);
    onWorldChange(progress.selectedWorld);

    let animationFrameId: number;
    let lastTime = performance.now();

    const VIRTUAL_WIDTH = 840;
    const VIRTUAL_HEIGHT = 460;
    const GROUND_Y = 360;

    s.chicken.y = GROUND_Y - s.chicken.height;

    const gameLoop = (currentTime: number) => {
      try {
        const dt = Math.min((currentTime - lastTime) / 1000, 0.1);
        lastTime = currentTime;

        if (!isPausedRef.current && !s.isDead) {
          s.time += dt;

          // 1. Physics: Floaty cartoon gravity with generous apex hang-time
          const timeScale = Math.min(dt * 60, 2.0);
          // Apex float: when soaring near peak of jump, reduce gravity so chicken floats gracefully
          const baseGravity = 0.46;
          const effectiveGravity = (Math.abs(s.chicken.vy) < 3.2 && !s.chicken.isGrounded) ? 0.28 : baseGravity;
          s.chicken.vy += effectiveGravity * timeScale;
          s.chicken.y += s.chicken.vy * timeScale;

          // Ground collision
          if (s.chicken.y >= GROUND_Y - s.chicken.height) {
            s.chicken.y = GROUND_Y - s.chicken.height;
            s.chicken.vy = 0;
            s.chicken.isGrounded = true;
            s.chicken.jumpsLeft = 2;
          } else {
            s.chicken.isGrounded = false;
          }

          // Lively animated trot along runway
          s.chicken.x = 95 + Math.sin(s.time * 2.5) * 6;

          // Expression reset
          if (currentTime > s.chicken.expressionEndTime && s.chicken.expression !== 'happy') {
            s.chicken.expression = 'happy';
          }

        // 2. Gradual ground scroll speed scaling: starts manageable (6.8) and smoothly ramps to fast (13.2)
        const speedProgress = Math.min(1, s.score / 3200);
        s.speed = s.baseSpeed + speedProgress * 6.4;
        const distanceDelta = s.speed * timeScale;
        s.scrollOffset += distanceDelta;
        s.score += Math.max(1, Math.round(distanceDelta * 0.14));

        // 3. New High Score celebration check
        if (s.score > s.bestScore && s.bestScore > 0 && !s.isNewRecordCelebrated) {
          s.isNewRecordCelebrated = true;
          s.chicken.expression = 'celebrating';
          s.chicken.expressionEndTime = currentTime + 1800;
          sound.playNewHighScore();

          // Spawn celebratory particles
          for (let i = 0; i < 20; i++) {
            s.particles.push({
              x: s.chicken.x + 25,
              y: s.chicken.y,
              vx: (Math.random() - 0.5) * 8,
              vy: -Math.random() * 8 - 2,
              size: Math.random() * 5 + 3,
              color: i % 2 === 0 ? '#facc15' : '#38bdf8',
              alpha: 1,
              life: 1,
              maxLife: 1,
              type: 'confetti',
            });
          }

          s.floatingTexts.push({
            id: s.floatingTextCounter++,
            text: 'NEW HIGH SCORE!',
            x: s.chicken.x,
            y: s.chicken.y - 30,
            color: '#f59e0b',
            size: 16,
            alpha: 1,
            life: 1.2,
          });
        }

        // 4. Milestone Check & Seamless World Transition
        checkMilestoneTransitions(s, currentTime);

        // 5. Gradual increase in obstacle spawn speed (frequency) as player's score increases
        s.distanceSinceLastObstacle += distanceDelta;
        if (s.distanceSinceLastObstacle >= s.nextObstacleDistance) {
          spawnObstacle(s, VIRTUAL_WIDTH, GROUND_Y);
          s.distanceSinceLastObstacle = 0;
          // Spawn interval curves down as score climbs: starts wide (470-670px) for manageable start,
          // then gradually narrows down to (310-440px) at high speeds for progressive arcade intensity
          const spawnSpacingScale = Math.max(0.66, 1 - (s.score / 3200) * 0.34);
          const minGap = 470 * spawnSpacingScale;
          const varGap = 200 * spawnSpacingScale;
          s.nextObstacleDistance = minGap + Math.random() * varGap;
        }

        // 6. Move and Update Obstacles
        for (let i = s.obstacles.length - 1; i >= 0; i--) {
          const obs = s.obstacles[i];
          obs.x -= distanceDelta;

          // Check Near-Miss (Surprise expression & close-call bonus)
          if (!obs.nearMissChecked && !obs.scored) {
            const chickenRight = s.chicken.x + s.chicken.width;
            const chickenBottom = s.chicken.y + s.chicken.height;
            const obsRight = obs.x + obs.width;

            // When chicken passes over the obstacle with narrow clearance
            if (chickenRight >= obs.x && s.chicken.x <= obsRight) {
              const verticalClearance = obs.y - chickenBottom;
              if (verticalClearance >= 0 && verticalClearance <= 48) {
                obs.nearMissChecked = true;
                s.score += 25; // Close call bonus!
                sound.playNearMiss();

                s.chicken.expression = 'surprised';
                s.chicken.expressionEndTime = currentTime + 800;

                setNearMissNotificationRef.current('+25 CLOSE CALL!');
                setTimeout(() => setNearMissNotificationRef.current(null), 1000);

                s.floatingTexts.push({
                  id: s.floatingTextCounter++,
                  text: '+25 CLOSE CALL!',
                  x: obs.x,
                  y: obs.y - 20,
                  color: '#fbbf24',
                  size: 14,
                  alpha: 1,
                  life: 0.9,
                });
              }
            }
          }

          // Check Collision
          if (currentTime > s.chicken.invulnerableUntil && checkCollision(s.chicken, obs)) {
            // Collision detected! Game Over!
            s.isDead = true;
            s.chicken.expression = 'dizzy';
            sound.playHit();

            // Check new unlocked items
            const finalScore = s.score;
            const isNewBest = finalScore > progress.bestScore;
            const unlockResult = unlockNewItems(finalScore, progress);
            onUpdateProgressRef.current(unlockResult.updatedProgress);

            setTimeout(() => {
              onGameOverRef.current({
                finalScore,
                bestScore: Math.max(progress.bestScore, finalScore),
                isNewBest,
                newUnlockedCostumes: unlockResult.newCostumes,
                newUnlockedWorlds: unlockResult.newWorlds,
              });
            }, 600);
            break;
          }

          // Score when passed
          if (!obs.scored && obs.x + obs.width < s.chicken.x) {
            obs.scored = true;
            s.score += 10;
          }

          // Remove off-screen obstacles
          if (obs.x + obs.width < -100) {
            s.obstacles.splice(i, 1);
          }
        }

        // 7. Update Particles
        for (let i = s.particles.length - 1; i >= 0; i--) {
          const p = s.particles[i];
          p.x += p.vx;
          p.y += p.vy;
          p.life -= dt;
          p.alpha = Math.max(0, p.life / p.maxLife);
          if (p.life <= 0) {
            s.particles.splice(i, 1);
          }
        }

        // 8. Update Floating Texts
        for (let i = s.floatingTexts.length - 1; i >= 0; i--) {
          const ft = s.floatingTexts[i];
          ft.y -= 25 * dt;
          ft.life -= dt;
          ft.alpha = Math.max(0, ft.life);
          if (ft.life <= 0) {
            s.floatingTexts.splice(i, 1);
          }
        }

        // Update score in UI HUD
        onScoreUpdateRef.current(s.score, Math.max(s.bestScore, s.score));
      }

      // ================= RENDER PHASE =================
      ctx.clearRect(0, 0, VIRTUAL_WIDTH, VIRTUAL_HEIGHT);

      // Render World Background
      renderWorldBackground(ctx, {
        ctx,
        width: VIRTUAL_WIDTH,
        height: VIRTUAL_HEIGHT,
        groundY: GROUND_Y,
        worldId: s.currentWorldId,
        scrollOffset: s.scrollOffset,
        time: s.time,
      });

      // Render Obstacles
      for (const obs of s.obstacles) {
        renderObstacle(ctx, obs, s.time);
      }

      // Render Ground
      renderWorldGround(ctx, VIRTUAL_WIDTH, VIRTUAL_HEIGHT, GROUND_Y, s.currentWorldId, s.scrollOffset);

      // Render Particles
      for (const p of s.particles) {
        ctx.save();
        ctx.fillStyle = p.color;
        ctx.globalAlpha = p.alpha;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      // Render Main Mascot Chicken
      drawChicken(ctx, {
        x: s.chicken.x,
        y: s.chicken.y,
        width: s.chicken.width,
        height: s.chicken.height,
        costume: s.costume,
        expression: s.chicken.expression,
        isJumping: !s.chicken.isGrounded,
        jumpProgress: 0,
        runCycle: s.scrollOffset * 0.05 + s.time * 0.8,
        isGrounded: s.chicken.isGrounded,
        scale: 1,
        showShadow: true,
        groundY: GROUND_Y,
      });

      // Render Floating Bonus Texts
      for (const ft of s.floatingTexts) {
        ctx.save();
        ctx.font = `bold ${ft.size}px sans-serif`;
        ctx.fillStyle = ft.color;
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 3;
        ctx.globalAlpha = ft.alpha;
        ctx.strokeText(ft.text, ft.x, ft.y);
        ctx.fillText(ft.text, ft.x, ft.y);
        ctx.restore();
      }

      // Render Near-Camera Foreground Parallax (1.25x - 1.45x flyby layer)
      renderWorldForeground(ctx, {
        ctx,
        width: VIRTUAL_WIDTH,
        height: VIRTUAL_HEIGHT,
        groundY: GROUND_Y,
        worldId: s.currentWorldId,
        scrollOffset: s.scrollOffset,
        time: s.time,
      });

      // Invulnerability shield flash if active
      if (currentTime < s.chicken.invulnerableUntil) {
        ctx.save();
        ctx.strokeStyle = 'rgba(56, 189, 248, 0.7)';
        ctx.lineWidth = 3;
        ctx.beginPath();
        ctx.ellipse(
          s.chicken.x + s.chicken.width / 2,
          s.chicken.y + s.chicken.height / 2,
          s.chicken.width * 0.65,
          s.chicken.height * 0.65,
          0,
          0,
          Math.PI * 2
        );
        ctx.stroke();
        ctx.restore();
      }

      // Render starting jump hint if player hasn't jumped yet
      if (!hasJumpedRef.current && s.time < 6) {
        ctx.save();
        ctx.font = 'bold 16px sans-serif';
        ctx.textAlign = 'center';
        ctx.fillStyle = '#ffffff';
        ctx.strokeStyle = '#0f172a';
        ctx.lineWidth = 4;
        const hintText = 'TAP ANYWHERE OR PRESS SPACE TO JUMP';
        ctx.strokeText(hintText, VIRTUAL_WIDTH / 2, 110);
        ctx.fillText(hintText, VIRTUAL_WIDTH / 2, 110);

        ctx.font = 'bold 12px sans-serif';
        ctx.lineWidth = 3;
        const subHint = 'Double jump in air for high hurdles!';
        ctx.strokeText(subHint, VIRTUAL_WIDTH / 2, 134);
        ctx.fillText(subHint, VIRTUAL_WIDTH / 2, 134);
        ctx.restore();
      }
    } catch (err) {
      console.error('Frame render exception:', err);
    } finally {
      animationFrameId = requestAnimationFrame(gameLoop);
    }
  };

    animationFrameId = requestAnimationFrame(gameLoop);
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  /**
   * Smoothly transitions the world when score reaches unlock milestones:
   * Farm -> Forest (500 pts)
   * Forest -> Candy (1500 pts)
   * Candy -> Space (3000 pts)
   */
  const checkMilestoneTransitions = (s: any, currentTime: number) => {
    let newWorldTarget: WorldId | null = null;
    let unlockMsg = '';

    if (s.score >= 3000 && s.currentWorldId !== 'space') {
      newWorldTarget = 'space';
      unlockMsg = 'COSMIC SPACE UNLOCKED!';
    } else if (s.score >= 1500 && s.score < 3000 && s.currentWorldId !== 'candy' && s.currentWorldId !== 'space') {
      newWorldTarget = 'candy';
      unlockMsg = 'CANDY KINGDOM UNLOCKED!';
    } else if (s.score >= 500 && s.score < 1500 && s.currentWorldId === 'farm') {
      newWorldTarget = 'forest';
      unlockMsg = 'MAGIC FOREST UNLOCKED!';
    }

    if (newWorldTarget) {
      s.currentWorldId = newWorldTarget;
      onWorldChangeRef.current(newWorldTarget);

      // Play triumphant fanfare
      sound.playWorldUnlock();

      // Show banner in HUD
      setTransitionMessageRef.current(unlockMsg);
      setTimeout(() => setTransitionMessageRef.current(null), 3200);

      // Clear immediate obstacles ahead within 380px so player never experiences cheap death!
      s.obstacles = s.obstacles.filter((obs: Obstacle) => obs.x < s.chicken.x || obs.x > s.chicken.x + 380);

      // Brief invulnerability grace
      s.chicken.invulnerableUntil = currentTime + 1600;

      // Spawn burst of celebration confetti
      for (let i = 0; i < 30; i++) {
        s.particles.push({
          x: 420,
          y: 200,
          vx: (Math.random() - 0.5) * 12,
          vy: -Math.random() * 10 - 2,
          size: Math.random() * 6 + 2,
          color: ['#f43f5e', '#ec4899', '#3b82f6', '#10b981', '#facc15'][i % 5],
          alpha: 1,
          life: 1.5,
          maxLife: 1.5,
          type: 'confetti',
        });
      }

      // Save unlocks to progress
      const unlockResult = unlockNewItems(s.score, progress);
      onUpdateProgressRef.current(unlockResult.updatedProgress);
    }
  };

  /**
   * Spawns obstacles appropriate for the current active world
   */
  const spawnObstacle = (s: any, width: number, groundY: number) => {
    const worldId: WorldId = s.currentWorldId;
    let obsWidth = 36;
    let obsHeight = 40;
    let type = 'crate';

    if (worldId === 'farm') {
      const types = ['crate', 'haybale', 'rock'];
      type = types[Math.floor(Math.random() * types.length)];
      if (type === 'haybale') {
        obsWidth = 42;
        obsHeight = 40;
      } else if (type === 'rock') {
        obsWidth = 46;
        obsHeight = 32;
      } else {
        obsWidth = 38;
        obsHeight = 42;
      }
    } else if (worldId === 'forest') {
      const types = ['log', 'shroom', 'crystal', 'bramble'];
      type = types[Math.floor(Math.random() * types.length)];
      if (type === 'log') {
        obsWidth = 52;
        obsHeight = 34;
      } else if (type === 'crystal') {
        obsWidth = 32;
        obsHeight = 52;
      } else if (type === 'bramble') {
        obsWidth = 40;
        obsHeight = 42;
      } else {
        obsWidth = 38;
        obsHeight = 44;
      }
    } else if (worldId === 'candy') {
      const types = ['candycane', 'gumdrop'];
      type = types[Math.floor(Math.random() * types.length)];
      if (type === 'candycane') {
        obsWidth = 34;
        obsHeight = 54;
      } else {
        obsWidth = 42;
        obsHeight = 38;
      }
    } else if (worldId === 'space') {
      const types = ['asteroid', 'laser'];
      type = types[Math.floor(Math.random() * types.length)];
      if (type === 'laser') {
        obsWidth = 28;
        obsHeight = 56;
      } else {
        obsWidth = 44;
        obsHeight = 42;
      }
    }

    s.obstacles.push({
      id: s.obstacleIdCounter++,
      x: width + 20,
      y: groundY - obsHeight,
      width: obsWidth,
      height: obsHeight,
      worldId,
      type,
      scored: false,
      nearMissChecked: false,
    });
  };

  /**
   * Collision detection with fair hitboxes (insets feather fluff)
   */
  const checkCollision = (chicken: any, obs: Obstacle): boolean => {
    const PADDING_X = 10;
    const PADDING_Y = 8;

    const cLeft = chicken.x + PADDING_X;
    const cRight = chicken.x + chicken.width - PADDING_X;
    const cTop = chicken.y + PADDING_Y;
    const cBottom = chicken.y + chicken.height;

    const oLeft = obs.x + 4;
    const oRight = obs.x + obs.width - 4;
    const oTop = obs.y + 4;
    const oBottom = obs.y + obs.height;

    return !(
      cRight < oLeft ||
      cLeft > oRight ||
      cBottom < oTop ||
      cTop > oBottom
    );
  };

  return (
    <div className="relative w-full h-full flex items-center justify-center cursor-pointer select-none overflow-hidden touch-none">
      <canvas
        ref={canvasRef}
        width={840}
        height={460}
        className="w-full h-full object-contain max-h-[85vh] drop-shadow-xl bg-slate-900 rounded-xl"
      />
    </div>
  );
};
