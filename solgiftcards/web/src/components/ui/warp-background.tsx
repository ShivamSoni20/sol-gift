"use client";

import { useEffect, useRef } from "react";
import { cn } from "@/lib/utils";

interface WarpBackgroundProps {
  children?: React.ReactNode;
  className?: string;
  containerClassName?: string;
  colors?: string[];
  warpSpeed?: "slow" | "fast";
  backgroundGradientClassName?: string;
}

export const WarpBackground = ({
  children,
  className,
  containerClassName,
  colors = ["#38bdf8", "#818cf8", "#c084fc", "#e879f9", "#22d3ee"],
  warpSpeed = "fast",
  backgroundGradientClassName,
}: WarpBackgroundProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const container = containerRef.current;
    if (!canvas || !container) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationFrameId: number;
    let w = (canvas.width = container.offsetWidth);
    let h = (canvas.height = container.offsetHeight);

    const resizeObserver = new ResizeObserver((entries) => {
      for (const entry of entries) {
        w = canvas.width = entry.contentRect.width;
        h = canvas.height = entry.contentRect.height;
      }
    });

    resizeObserver.observe(container);

    class Star {
      x: number;
      y: number;
      z: number;
      px: number;
      py: number;

      constructor() {
        this.x = Math.random() * w - w / 2;
        this.y = Math.random() * h - h / 2;
        this.z = Math.random() * 1500;
        this.px = 0;
        this.py = 0;
      }

      update(speed: number) {
        this.z -= speed;
        if (this.z <= 0) {
          this.x = Math.random() * w - w / 2;
          this.y = Math.random() * h - h / 2;
          this.z = 1500;
        }
      }

      draw() {
        if (!ctx) return;

        const sx = (this.x / this.z) * 500 + w / 2;
        const sy = (this.y / this.z) * 500 + h / 2;
        const size = (1 - this.z / 1500) * 2;

        const gradient = ctx.createRadialGradient(sx, sy, 0, sx, sy, size);
        const colorIndex = Math.floor(Math.random() * colors.length);
        gradient.addColorStop(0, colors[colorIndex]);
        gradient.addColorStop(1, "transparent");

        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(sx, sy, size, 0, Math.PI * 2);
        ctx.fill();

        // Draw trail
        if (this.px !== 0 && this.py !== 0) {
          ctx.strokeStyle = `${colors[colorIndex]}40`;
          ctx.lineWidth = size / 2;
          ctx.beginPath();
          ctx.moveTo(this.px, this.py);
          ctx.lineTo(sx, sy);
          ctx.stroke();
        }

        this.px = sx;
        this.py = sy;
      }
    }

    const stars: Star[] = [];
    const numStars = 200;

    for (let i = 0; i < numStars; i++) {
      stars.push(new Star());
    }

    const speed = warpSpeed === "fast" ? 8 : 3;

    const animate = () => {
      ctx.fillStyle = "rgba(0, 0, 0, 0.1)";
      ctx.fillRect(0, 0, w, h);

      stars.forEach((star) => {
        star.update(speed);
        star.draw();
      });

      animationFrameId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      cancelAnimationFrame(animationFrameId);
      resizeObserver.disconnect();
    };
  }, [colors, warpSpeed]);

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative flex h-full w-full items-center justify-center overflow-hidden",
        containerClassName
      )}
    >
      <canvas
        ref={canvasRef}
        className={cn(
          "absolute inset-0 z-0",
          backgroundGradientClassName ||
            "bg-gradient-to-br from-purple-900/20 via-blue-900/20 to-purple-900/20 dark:from-purple-950/40 dark:via-blue-950/40 dark:to-purple-950/40"
        )}
      />
      <div className={cn("relative z-10", className)}>{children}</div>
    </div>
  );
};
