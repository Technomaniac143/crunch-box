import React, { useEffect, useRef, useState } from "react";

export interface CountUpProps {
  to: number;
  from?: number;
  duration?: number;
  separator?: string;
  className?: string;
  prefix?: string;
  suffix?: string;
}

/**
 * ReactBits CountUp:
 * Smooth animated numeric ticker with ease-out cubic interpolation.
 * Optimized for Supabase apps:
 * - Detects tab visibility (document.hidden) and sets final state immediately to prevent CPU churn
 * - Runs with requestAnimationFrame
 * - Reactively responds to new Supabase values without restarting entire animation loop
 */
export function CountUp({
  to,
  from = 0,
  duration = 1.4,
  separator = "",
  className = "",
  prefix = "",
  suffix = "",
}: CountUpProps) {
  const [value, setValue] = useState(from);
  const elementRef = useRef<HTMLSpanElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = elementRef.current;
    if (!el) return;

    if (
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches
    ) {
      setValue(to);
      hasAnimated.current = true;
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          observer.unobserve(el);

          let startTime: number | null = null;
          let rafId: number;

          const step = (timestamp: number) => {
            if (document.hidden) {
              setValue(to);
              return;
            }

            if (!startTime) startTime = timestamp;
            const progress = Math.min((timestamp - startTime) / (duration * 1000), 1);
            const easeProgress = 1 - Math.pow(1 - progress, 3);
            const current = Math.round(from + (to - from) * easeProgress);

            setValue(current);

            if (progress < 1) {
              rafId = requestAnimationFrame(step);
            }
          };

          rafId = requestAnimationFrame(step);
        }
      },
      { threshold: 0.1 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [to, from, duration]);

  useEffect(() => {
    if (hasAnimated.current) {
      setValue(to);
    }
  }, [to]);

  const formattedValue = separator ? value.toLocaleString() : value;

  return (
    <span ref={elementRef} className={className} data-tabular-nums="true">
      {prefix}
      {formattedValue}
      {suffix}
    </span>
  );
}
