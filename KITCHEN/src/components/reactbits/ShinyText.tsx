import React from "react";
import { cn } from "@/lib/utils";

export interface ShinyTextProps {
  text: string;
  disabled?: boolean;
  speed?: number; // seconds
  className?: string;
  shimmerColor?: string;
}

/**
 * ReactBits ShinyText:
 * Adds a gleaming shimmer passing across text.
 * Optimized for Supabase apps:
 * - Pure CSS background-clip + keyframes. 0ms JavaScript runtime overhead.
 * - Hardware accelerated.
 */
export function ShinyText({
  text,
  disabled = false,
  speed = 3,
  className = "",
  shimmerColor = "rgba(255, 255, 255, 0.85)",
}: ShinyTextProps) {
  const animationDuration = `${speed}s`;

  return (
    <span
      className={cn(
        "relative inline-block bg-clip-text text-transparent transition-all",
        !disabled && "animate-shiny-text",
        className,
      )}
      style={{
        backgroundImage: `linear-gradient(110deg, currentColor 35%, ${shimmerColor} 50%, currentColor 65%)`,
        backgroundSize: "200% 100%",
        WebkitBackgroundClip: "text",
        animationDuration,
      }}
    >
      {text}
    </span>
  );
}
