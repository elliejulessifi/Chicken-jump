import React, { useEffect, useRef } from 'react';
import { CostumeId, ChickenExpression } from '../game/types.ts';
import { drawChicken } from '../game/chickenRenderer.ts';

interface ChickenPreviewCanvasProps {
  costume: CostumeId;
  expression?: ChickenExpression;
  width?: number;
  height?: number;
  scale?: number;
  interactive?: boolean;
}

export const ChickenPreviewCanvas: React.FC<ChickenPreviewCanvasProps> = ({
  costume,
  expression = 'happy',
  width = 160,
  height = 160,
  scale = 1.35,
}) => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animId: number;
    let startTime = performance.now();

    const render = (now: number) => {
      const elapsed = (now - startTime) / 1000;

      ctx.clearRect(0, 0, width, height);

      drawChicken(ctx, {
        x: width * 0.5 - 28,
        y: height * 0.5 - 28,
        width: 56,
        height: 56,
        costume,
        expression,
        isJumping: false,
        jumpProgress: 0,
        runCycle: elapsed,
        isGrounded: true,
        scale,
        showShadow: true,
        groundY: height * 0.5 + 28,
      });

      animId = requestAnimationFrame(render);
    };

    animId = requestAnimationFrame(render);
    return () => cancelAnimationFrame(animId);
  }, [costume, expression, width, height, scale]);

  return (
    <canvas
      ref={canvasRef}
      width={width}
      height={height}
      className="max-w-full drop-shadow-md select-none pointer-events-none"
    />
  );
};
