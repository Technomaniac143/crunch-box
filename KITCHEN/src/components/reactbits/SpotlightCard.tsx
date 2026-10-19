import React, { useRef, useCallback, useEffect } from "react";
import { cn } from "@/lib/utils";

export interface SpotlightCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
  spotlightColor?: string;
  borderColor?: string;
}

/**
 * ReactBits SpotlightCard:
 * Adds a smooth radial spotlight glow tracking the pointer.
 * Optimized for Supabase apps:
 * - Direct DOM manipulation of CSS variables (--mouse-x, --mouse-y) with requestAnimationFrame
 * - ZERO React state re-renders on mousemove
 * - Clean teardown on unmount
 */
export function SpotlightCard({
  children,
  className,
  spotlightColor = "rgba(255, 185, 40, 0.16)",
  borderColor = "rgba(255, 185, 40, 0.35)",
  ...props
}: SpotlightCardProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const rafId = useRef<number | null>(null);

  const handleMouseMove = useCallback((e: React.MouseEvent<HTMLDivElement>) => {
    if (!cardRef.current) return;
    const card = cardRef.current;

    if (rafId.current) cancelAnimationFrame(rafId.current);

    rafId.current = requestAnimationFrame(() => {
      const rect = card.getBoundingClientRect();
      const x = e.clientX - rect.left;
      const y = e.clientY - rect.top;
      card.style.setProperty("--mouse-x", `${x}px`);
      card.style.setProperty("--mouse-y", `${y}px`);
      card.style.setProperty("--spotlight-opacity", "1");
    });
  }, []);

  const handleMouseLeave = useCallback(() => {
    if (!cardRef.current) return;
    if (rafId.current) cancelAnimationFrame(rafId.current);
    cardRef.current.style.setProperty("--spotlight-opacity", "0");
  }, []);

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
      className={cn(
        "group relative overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300",
        className,
      )}
      style={{
        ["--mouse-x" as string]: "-999px",
        ["--mouse-y" as string]: "-999px",
        ["--spotlight-opacity" as string]: "0",
      }}
      {...props}
    >
      {/* Background Spotlight Glow */}
      <div
        className="pointer-events-none absolute inset-0 z-0 transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          background: `radial-gradient(circle 260px at var(--mouse-x, -999px) var(--mouse-y, -999px), ${spotlightColor}, transparent 75%)`,
          willChange: "opacity, background",
        }}
        aria-hidden="true"
      />

      {/* Border Highlight Effect */}
      <div
        className="pointer-events-none absolute inset-0 z-0 rounded-[inherit] transition-opacity duration-300"
        style={{
          opacity: "var(--spotlight-opacity, 0)",
          boxShadow: `inset 0 0 0 1px ${borderColor}`,
        }}
        aria-hidden="true"
      />

      {/* Content wrapper with relative positioning so it sits cleanly above glow */}
      <div className="relative z-10 flex h-full flex-col">{children}</div>
    </div>
  );
}
