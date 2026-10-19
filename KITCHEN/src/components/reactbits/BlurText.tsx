import React, { useEffect, useRef, useState } from "react";
import { cn } from "@/lib/utils";

export interface BlurTextProps {
  text: string;
  delay?: number;
  className?: string;
  animateBy?: "words" | "letters";
  direction?: "top" | "bottom";
  threshold?: number;
}

/**
 * ReactBits BlurText:
 * Words animate smoothly from a soft blur into focus.
 * Optimized for Supabase apps:
 * - Uses IntersectionObserver with disconnect upon entry
 * - GPU accelerated transforms
 */
export function BlurText({
  text,
  delay = 45,
  className = "",
  animateBy = "words",
  direction = "bottom",
  threshold = 0.1,
}: BlurTextProps) {
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
      { threshold },
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [threshold]);

  const elements = animateBy === "words" ? text.split(" ") : text.split("");

  return (
    <span ref={ref} className={cn("inline-block", className)}>
      {elements.map((element, index) => (
        <span
          key={index}
          className="inline-block transition-all duration-500 ease-out"
          style={{
            transitionDelay: `${index * delay}ms`,
            opacity: inView ? 1 : 0,
            filter: inView ? "blur(0px)" : "blur(8px)",
            transform: inView
              ? "translate3d(0,0,0)"
              : `translate3d(0, ${direction === "top" ? "-10px" : "10px"}, 0)`,
            marginRight: animateBy === "words" && index < elements.length - 1 ? "0.28em" : undefined,
          }}
        >
          {element}
        </span>
      ))}
    </span>
  );
}
