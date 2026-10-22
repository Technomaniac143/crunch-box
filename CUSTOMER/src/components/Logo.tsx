import { Link } from "@tanstack/react-router";
import logoImg from "@/assets/images/logo-sm.webp";
import logoFull from "@/assets/images/logo.webp";

export function Logo({
  size = "md",
  className = "",
}: {
  size?: "sm" | "md" | "lg";
  className?: string;
}) {
  const dim =
    size === "sm"
      ? "h-12 w-12"
      : size === "lg"
        ? "h-20 w-20"
        : "h-16 w-16";
  const px = size === "sm" ? 48 : size === "lg" ? 80 : 64;

  return (
    <Link
      to="/"
      aria-label="Crunch Box home"
      className={`group flex items-center gap-2.5 outline-none transition-transform duration-200 active:scale-95 ${className}`}
    >
      <div className={`relative ${dim} shrink-0 drop-shadow-sm transition-transform duration-300 group-hover:scale-105`}>
        <img
          src={size === "lg" ? logoFull : logoImg}
          alt="Crunch Box — French Fries &amp; Loaded Fries"
          width={px}
          height={px}
          className="h-full w-full object-contain select-none"
          loading="eager"
          decoding="async"
        />
      </div>
    </Link>
  );
}

