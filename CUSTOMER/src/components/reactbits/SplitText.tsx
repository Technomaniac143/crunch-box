import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface SplitTextProps {
  text: string;
  className?: string;
  delay?: number;
  animationFrom?: { opacity: number; transform: string };
  animationTo?: { opacity: number; transform: string };
  easing?: string;
  threshold?: number;
  rootMargin?: string;
  textAlign?: "left" | "right" | "center" | "justify" | "initial" | "inherit";
  splitBy?: "words" | "chars";
  onLetterAnimationComplete?: () => void;
}

/**
 * ReactBits SplitText:
 * Staggers words/characters with cubic-bezier spring physics.
 * Optimized for Supabase apps:
 * - Uses IntersectionObserver with single trigger (unobserves immediately to save memory)
 * - Pure hardware-accelerated transforms (translate3d, opacity)
 * - Automatic prefers-reduced-motion bypass
 */
export function SplitText({
  text,
  className = "",
  delay = 40,
  animationFrom = { opacity: 0, transform: "translate3d(0, 24px, 0)" },
  animationTo = { opacity: 1, transform: "translate3d(0, 0, 0)" },
  easing = "cubic-bezier(0.2, 0.65, 0.3, 0.9)",
  threshold = 0.1,
  rootMargin = "-20px",
  textAlign = "initial",
  splitBy = "words",
  onLetterAnimationComplete,
}: SplitTextProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setInView(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setInView(true);
          observer.unobserve(el);
        }
      },
      { threshold, rootMargin },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold, rootMargin]);

  const items = splitBy === "words" ? text.split(" ") : text.split("");

  return (
    <span
      ref={ref}
      className={cn("inline-block", className)}
      style={{ textAlign, willChange: inView ? "auto" : "transform, opacity" }}
    >
      {items.map((item, index) => {
        const itemDelay = index * delay;
        return (
          <span
            key={index}
            className="inline-block transition-all"
            style={{
              transitionDuration: "500ms",
              transitionTimingFunction: easing,
              transitionDelay: `${itemDelay}ms`,
              opacity: inView ? animationTo.opacity : animationFrom.opacity,
              transform: inView ? animationTo.transform : animationFrom.transform,
              marginRight: splitBy === "words" && index < items.length - 1 ? "0.28em" : undefined,
            }}
            onTransitionEnd={index === items.length - 1 ? onLetterAnimationComplete : undefined}
          >
            {item}
          </span>
        );
      })}
    </span>
  );
}
