import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface AnimatedContentProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  distance?: number;
  direction?: "vertical" | "horizontal";
  reverse?: boolean;
  delay?: number;
  duration?: number;
  className?: string;
}

/**
 * ReactBits AnimatedContent:
 * Staggered fade and slide-up entrance for cards and list items on viewport entry.
 * Optimized for Supabase apps:
 * - Unobserves immediately after entry to prevent memory leaks and scroll jank
 * - Respects prefers-reduced-motion
 */
export function AnimatedContent({
  children,
  distance = 20,
  direction = "vertical",
  reverse = false,
  delay = 0,
  duration = 450,
  className = "",
  ...props
}: AnimatedContentProps) {
  const [inView, setInView] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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
      { threshold: 0.08 },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  const translateVal = reverse ? -distance : distance;
  const transformInitial =
    direction === "vertical"
      ? `translate3d(0, ${translateVal}px, 0)`
      : `translate3d(${translateVal}px, 0, 0)`;

  return (
    <div
      ref={ref}
      className={cn("transition-all ease-out", className)}
      style={{
        transitionDuration: `${duration}ms`,
        transitionDelay: `${delay}ms`,
        opacity: inView ? 1 : 0,
        transform: inView ? "translate3d(0, 0, 0)" : transformInitial,
        willChange: inView ? "auto" : "transform, opacity",
      }}
      {...props}
    >
      {children}
    </div>
  );
}
