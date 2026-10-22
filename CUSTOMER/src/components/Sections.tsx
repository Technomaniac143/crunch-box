import { Link } from "@tanstack/react-router";
import { ArrowRight, Award, Flame, HeartHandshake, Truck } from "lucide-react";
import type { ReactNode } from "react";
import loaded from "@/assets/images/loaded.webp";

export function SectionTitle({ children, action }: { children: ReactNode; action?: ReactNode }) {
  return (
    <div className="mb-5 flex items-end justify-between gap-4">
      <h2 className="flex items-center gap-2 text-2xl sm:text-3xl">
        <span className="text-accent">⟋</span>
        {children}
        <span className="text-accent">⟍</span>
      </h2>
      {action}
    </div>
  );
}

export function ViewAll({ to, label = "View All" }: { to: "/menu" | "/combos"; label?: string }) {
  return (
    <Link
      to={to}
      className="flex shrink-0 items-center gap-1 text-sm font-semibold text-primary hover:underline"
    >
      {label} <ArrowRight className="h-4 w-4" />
    </Link>
  );
}

export function PromoBanner() {
  return (
    <section className="relative grid overflow-hidden rounded-2xl bg-brand text-brand-foreground sm:grid-cols-2">
      <div className="relative z-10 flex flex-col justify-center gap-3 p-6 sm:p-10">
        <h2 className="text-3xl leading-none sm:text-5xl">
          Craving something <span className="block text-accent">crunchy?</span>
        </h2>
        <p className="font-semibold uppercase tracking-wide text-brand-foreground/85">
          Order now & get it delivered fast!
        </p>
        <Link
          to="/menu"
          className="mt-2 inline-flex w-fit items-center gap-2 rounded-lg bg-accent px-5 py-3 font-display uppercase text-accent-foreground transition hover:brightness-105 active:scale-95"
        >
          Order Now <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
      <img
        src={loaded}
        alt="Loaded fries with chicken and cheese"
        loading="lazy"
        decoding="async"
        width={816}
        height={816}
        className="h-56 w-full object-cover sm:h-80"
      />
    </section>
  );
}

const benefits = [
  { icon: Award, title: "Premium Quality", text: "Only the best ingredients, always fresh." },
  { icon: Flame, title: "Made Hot", text: "Cooked fresh and served hot every time." },
  { icon: Truck, title: "Fast Delivery", text: "Delivered hot and fresh." },
  { icon: HeartHandshake, title: "Customer First", text: "Your satisfaction is our priority." },
];

export function Benefits() {
  return (
    <section className="grid grid-cols-2 gap-3 rounded-2xl bg-secondary p-4 sm:p-6 lg:grid-cols-4">
      {benefits.map(({ icon: Icon, title, text }) => (
        <div
          key={title}
          className="flex flex-col items-start gap-2 rounded-xl p-3 sm:flex-row sm:items-center"
        >
          <span className="grid h-12 w-12 shrink-0 place-items-center rounded-full border-2 border-accent text-brand">
            <Icon className="h-6 w-6" strokeWidth={1.5} />
          </span>
          <div>
            <h3 className="text-base">{title}</h3>
            <p className="text-sm text-muted-foreground">{text}</p>
          </div>
        </div>
      ))}
    </section>
  );
}

export function AboutBlock({ showCta = true }: { showCta?: boolean }) {
  return (
    <section className="grid items-center gap-8 lg:grid-cols-2">
      <img
        src={loaded}
        alt="A tray of loaded fries"
        loading="lazy"
        decoding="async"
        width={816}
        height={816}
        className="aspect-[4/3] w-full rounded-2xl object-cover shadow-card"
      />
      <div className="space-y-4">
        <span className="brush text-sm">Our story</span>
        <h2 className="text-4xl sm:text-5xl">About Crunch Box</h2>
        <p className="text-lg text-foreground/80">
          At Crunch Box, we're all about bold flavors, crispy perfection, and unforgettable crunch.
          From classic fries to loaded delights and juicy peri-peri chicken, we've got your
          late-night cravings covered!
        </p>
        {showCta && (
          <Link
            to="/about"
            className="inline-flex items-center gap-2 rounded-lg border-2 border-brand px-5 py-2.5 font-display uppercase text-brand transition hover:bg-brand hover:text-brand-foreground"
          >
            Learn More <ArrowRight className="h-4 w-4" />
          </Link>
        )}
      </div>
    </section>
  );
}

export function PageHeading({ title, sub }: { title: string; sub?: string }) {
  return (
    <div className="mb-8 animate-rise">
      <h1 className="text-4xl sm:text-5xl">{title}</h1>
      {sub && <p className="mt-2 text-muted-foreground">{sub}</p>}
    </div>
  );
}
