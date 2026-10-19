import React, { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface MagnetProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  padding?: number;
  disabled?: boolean;
  magnetStrength?: number;
  className?: string;
}

/**
 * ReactBits Magnet:
 * Gently attracts interactive elements towards the pointer on hover.
 * Optimized for Supabase apps:
 * - Direct translate3d style updates via requestAnimationFrame
 * - NO React state re-renders
 * - Auto cleans up on mouse leave or unmount
 */
export function Magnet({
  children,
  padding = 35,
  disabled = false,
  magnetStrength = 0.22,
  className = "",
  ...props
}: MagnetProps) {
  const magnetRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback(
    (e: MouseEvent) => {
      if (disabled || !magnetRef.current) return;
      const el = magnetRef.current;
      const rect = el.getBoundingClientRect();
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;

      const dist = Math.hypot(e.clientX - centerX, e.clientY - centerY);
      const maxDist = Math.max(rect.width, rect.height) / 2 + padding;

      if (dist < maxDist) {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          const offsetX = (e.clientX - centerX) * magnetStrength;
          const offsetY = (e.clientY - centerY) * magnetStrength;
          el.style.transform = `translate3d(${offsetX}px, ${offsetY}px, 0)`;
        });
      } else {
        if (rafId.current) cancelAnimationFrame(rafId.current);
        rafId.current = requestAnimationFrame(() => {
          el.style.transform = "translate3d(0, 0, 0)";
        });
      }
    },
    [disabled, magnetStrength, padding],
  );

  const handleMouseLeave = useCallback(() => {
    if (!magnetRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    magnetRef.current.style.transform = "translate3d(0, 0, 0)";
  }, []);

  useEffect(() => {
    if (disabled) return;
    window.addEventListener("mousemove", handleMouseMove, { passive: true });
    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      if (rafId.current) cancelAnimationFrame(rafId.current);
    };
  }, [handleMouseMove, disabled]);

  return (
    <div
      ref={magnetRef}
      onMouseLeave={handleMouseLeave}
      className={cn("inline-block transition-transform duration-200 ease-out", className)}
      style={{ willChange: "transform" }}
      {...props}
    >
      {children}
    </div>
  );
}
