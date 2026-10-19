import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { ArrowRight, Clock, Search, Timer } from "lucide-react";
import { useState } from "react";
import hero from "@/assets/images/hero.jpg";
import { products, specialCombos, getProduct } from "@/data/menu";
import { site } from "@/data/site";
import { ProductCard } from "@/components/ProductCard";
import { ComboCard } from "@/components/ComboCard";
import { CategoryNavigation } from "@/components/CategoryNavigation";
import { AboutBlock, Benefits, PromoBanner, SectionTitle, ViewAll } from "@/components/Sections";
import {
  Aurora,
  Squares,
  SplitText,
  ShinyText,
  BlurText,
  Magnet,
  TiltedCard,
  AnimatedContent,
} from "@/components/reactbits";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Crunch Box — Crispy. Loaded. Irresistible." },
      {
        name: "description",
        content:
          "French fries, loaded fries, fried chicken, rice bowls and combos. Open 6 PM – 3 AM.",
      },
      { property: "og:title", content: "Crunch Box — Crispy. Loaded. Irresistible." },
      {
        property: "og:description",
        content: "Order fries, loaded fries and chicken from Crunch Box.",
      },
    ],
  }),
  component: Index,
});

function Index() {
  const navigate = useNavigate();
  const [q, setQ] = useState("");
  const popular = products.filter((p) => p.popular);
  const combos = specialCombos.map((id) => getProduct(id)!);

  return (
    <div className="relative mx-auto max-w-7xl space-y-14 px-4 pb-10">
      {/* Hero Section with Aurora & Squares Motion */}
      <section className="relative overflow-hidden rounded-3xl border border-border/60 bg-gradient-to-b from-card/80 to-background/90 p-6 shadow-sm lg:p-10">
        <Aurora />
        <Squares
          speed={0.3}
          squareSize={48}
          borderColor="rgba(74, 32, 19, 0.05)"
          hoverFillColor="rgba(255, 185, 40, 0.14)"
          className="opacity-40"
        />

        <div className="relative z-10 grid items-center gap-8 lg:grid-cols-[1.1fr_1.2fr]">
          <div className="space-y-5">
            <h1 className="text-[3.2rem] font-bold italic leading-[0.92] sm:text-7xl xl:text-8xl">
              <span className="block">
                <SplitText text="Crispy." delay={45} />
              </span>
              <span className="block text-primary">
                <SplitText text="Loaded." delay={55} />
              </span>
              <span className="block">
                <SplitText text="Irresistible." delay={40} />
              </span>
            </h1>

            <div className="inline-block">
              <span className="brush -rotate-2 text-xl shadow-sm sm:text-2xl">
                <ShinyText text="French Fries & More" speed={3.5} />
              </span>
            </div>

            <p className="font-script text-2xl text-primary">{site.tagline}</p>
            <p className="text-lg text-foreground/80">
              <BlurText text="Hot, fresh, and delivered fast." delay={30} />
            </p>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Magnet padding={30} magnetStrength={0.18}>
                <Link
                  to="/menu"
                  className="inline-block rounded-xl bg-primary px-7 py-3.5 font-display uppercase tracking-wide text-primary-foreground shadow-lift transition hover:brightness-110 active:scale-95"
                >
                  Order Now
                </Link>
              </Magnet>
              <Magnet padding={30} magnetStrength={0.18}>
                <Link
                  to="/menu"
                  className="inline-block rounded-xl border-2 border-brand bg-card/60 px-6 py-3 font-display uppercase tracking-wide text-brand backdrop-blur transition hover:bg-brand hover:text-brand-foreground active:scale-95"
                >
                  Explore Menu
                </Link>
              </Magnet>
            </div>

            <div className="flex flex-wrap gap-4 text-sm font-semibold pt-2">
              <span className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 shadow-xs">
                <Clock className="h-4 w-4 text-primary" /> {site.hours}
              </span>
              <span className="flex items-center gap-1.5 rounded-full border border-border/80 bg-card/80 px-3 py-1 shadow-xs">
                <Timer className="h-4 w-4 text-primary" /> {site.deliveryPromise}
              </span>
            </div>
          </div>

          {/* 3D Tilted Hero Banner */}
          <TiltedCard maxTilt={6} scale={1.015} className="w-full">
            <div className="overflow-hidden rounded-3xl border border-border/80 shadow-lift">
              <img
                src={hero}
                fetchPriority="high"
                loading="eager"
                decoding="async"
                alt="Loaded fries, french fries, cola and popcorn chicken"
                width={1536}
                height={1024}
                className="w-full object-cover transition-transform duration-500 hover:scale-105"
              />
            </div>
          </TiltedCard>
        </div>
      </section>

      {/* Search + categories */}
      <section className="space-y-4">
        <form
          role="search"
          onSubmit={(e) => {
            e.preventDefault();
            navigate({ to: "/menu", search: { q: q.trim() || undefined } });
          }}
          className="relative"
        >
          <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            aria-label="Search menu"
            placeholder="Search for your favorites..."
            className="h-14 w-full rounded-2xl border bg-card pl-12 pr-4 shadow-card outline-none transition-shadow focus:border-primary focus:ring-2 focus:ring-primary/20"
          />
        </form>
        <CategoryNavigation
          active="all"
          onChange={(id) =>
            navigate({ to: "/menu", search: { cat: id === "all" ? undefined : id } })
          }
        />
      </section>

      <PromoBanner />

      {/* Popular Items with Smooth Staggered AnimatedContent */}
      <section>
        <SectionTitle action={<ViewAll to="/menu" />}>
          <SplitText text="Popular Items" delay={40} />
        </SectionTitle>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-2 sm:overflow-visible sm:px-0 lg:grid-cols-3 xl:grid-cols-6">
          {popular.map((p, idx) => (
            <AnimatedContent
              key={p.id}
              delay={idx * 60}
              className="w-64 shrink-0 snap-start sm:w-auto"
            >
              <ProductCard product={p} compact />
            </AnimatedContent>
          ))}
        </div>
      </section>

      {/* Combo Offers with Smooth Staggered AnimatedContent */}
      <section>
        <SectionTitle action={<ViewAll to="/combos" label="View All Combos" />}>
          <SplitText text="Combo Offers" delay={40} />
        </SectionTitle>
        <div className="no-scrollbar -mx-4 flex snap-x gap-4 overflow-x-auto px-4 pb-2 md:mx-0 md:grid md:grid-cols-3 md:px-0">
          {combos.map((c, idx) => (
            <AnimatedContent key={c.id} delay={idx * 80} className="w-80 shrink-0 snap-start md:w-auto">
              <ComboCard product={c} />
            </AnimatedContent>
          ))}
        </div>
      </section>

      <Benefits />
      <AboutBlock />

      <Link
        to="/menu"
        className="group flex items-center justify-center gap-2 font-display text-lg uppercase text-primary transition hover:underline"
      >
        See the full menu{" "}
        <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
      </Link>
    </div>
  );
}
