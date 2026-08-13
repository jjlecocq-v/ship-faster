import type { ReactNode } from "react";

type HeroProps = {
  headline: string;
  date: string;
};

export function Hero({ headline, date }: HeroProps): ReactNode {
  return (
    <section className="hero">
      <p className="hero-kicker">{date}</p>
      <h1 className="hero-headline">{headline}</h1>
      <p className="hero-sub">
        Preview every commit. Cache the work you already did. Ship when you
        mean it.
      </p>
    </section>
  );
}
