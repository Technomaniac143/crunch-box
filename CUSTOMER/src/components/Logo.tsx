import { Link } from "@tanstack/react-router";

export function Logo({ size = "md" }: { size?: "sm" | "md" }) {
  const s = size === "sm" ? "h-12 w-12 text-[10px]" : "h-16 w-16 text-xs";
  return (
    <Link to="/" aria-label="Crunch Box home" className="flex items-center gap-2">
      <span
        className={`grid ${s} shrink-0 place-items-center rounded-full border-4 border-accent bg-brand text-center font-display leading-none text-brand-foreground shadow-card`}
      >
        <span>
          CRUNCH
          <br />
          <span className="text-accent">BOX</span>
        </span>
      </span>
    </Link>
  );
}
