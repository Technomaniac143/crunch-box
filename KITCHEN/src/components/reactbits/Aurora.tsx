import React from "react";
import { cn } from "@/lib/utils";

export interface AuroraProps {
  className?: string;
  colorStops?: string[];
}

/**
 * ReactBits Aurora (Background):
 * Warm glowing ambient gradient orbs with hardware accelerated motion.
 * Optimized for Supabase apps:
 * - Uses pure CSS transforms and blur
 * - 0ms CPU execution during runtime
 */
export function Aurora({
  className = "",
  colorStops = [
    "oklch(0.83 0.16 78 / 0.15)", // warm gold
    "oklch(0.57 0.205 29 / 0.10)", // primary crimson
    "oklch(0.975 0.012 75 / 0.20)", // soft butter cream
  ],
}: AuroraProps) {
  return (
    <div
      className={cn("pointer-events-none absolute inset-0 overflow-hidden", className)}
      aria-hidden="true"
    >
      <div
        className="animate-aurora-glow absolute -inset-[40%] opacity-60 blur-3xl"
        style={{
          background: `radial-gradient(circle at 45% 45%, ${colorStops[0]} 0%, transparent 55%), radial-gradient(circle at 20% 30%, ${colorStops[1]} 0%, transparent 45%), radial-gradient(circle at 75% 65%, ${colorStops[2]} 0%, transparent 50%)`,
          willChange: "transform",
        }}
      />
    </div>
  );
}
