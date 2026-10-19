import React, { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface TiltedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  maxTilt?: number;
  perspective?: number;
  scale?: number;
  glare?: boolean;
}

/**
 * ReactBits TiltedCard:
 * 3D perspective tilt effect on pointer hover with interactive glare.
 * Optimized for Supabase apps:
 * - Direct style updates via requestAnimationFrame
 * - No React state churn
 */
export function TiltedCard({
  children,
  className = "",
  maxTilt = 7,
  perspective = 1000,
  scale = 1.015,
  glare = true,
  ...props
}: TiltedCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!cardRef.current) return;
      const card = cardRef.current;
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;

      const centerX = rect.width / 2;
      const centerY = rect.height / 2;

      const rotateX = ((y - centerY) / centerY) * -maxTilt;
      const rotateY = ((x - centerX) / centerX) * maxTilt;

      if (rafId.current) cancelAnimationFrame(rafId.current);
      rafId.current = requestAnimationFrame(() => {
        card.style.transform = `perspective(${perspective}px) rotateX(${rotateX.toFixed(2)}deg) rotateY(${rotateY.toFixed(2)}deg) scale3d(${scale}, ${scale}, ${scale})`;

        if (glareRef.current) {
          const glareX = (x / rect.width) * 100;
          const glareY = (y / rect.height) * 100;
          glareRef.current.style.opacity = "0.2";
          glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.7), transparent 65%)`;
        }
      });
    },
    [maxTilt, perspective, scale],
  );

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    cardRef.current.style.transform = `perspective(${perspective}px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
    if (glareRef.current) {
      glareRef.current.style.opacity = "0";
    }
  }, [perspective]);

  useEffect(() => {
    return () => {
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={cardRef}
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
      className={cn("relative transition-transform duration-200 ease-out", className)}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
      }}
      {...props}
    >
      {children}
      {glare && (
        <div
          ref={glareRef}
          className="pointer-events-none absolute inset-0 z-20 rounded-[inherit] opacity-0 transition-opacity duration-300"
          aria-hidden="true"
        />
      )}
    </div>
  );
}
