import { Hero } from "@ship/ui";
import { formatDate } from "@ship/utils";
import Link from "next/link";
import { heroHeadline } from "../lib/copy";

export default function Home() {
  const today = formatDate(new Date());

  return (
    <div className="flex min-h-full flex-col">
      <header className="flex items-center justify-between border-b border-white/10 px-8 py-5">
        <span className="text-sm font-medium tracking-[0.2em] text-zinc-400 uppercase">
          Ship Faster
        </span>
        <Link
          href="/settings"
          className="text-sm text-zinc-400 transition-colors hover:text-zinc-100"
        >
          Settings
        </Link>
      </header>
      <main className="flex flex-1 items-center px-8 py-24">
        <Hero headline={heroHeadline} date={today} />
      </main>
    </div>
  );
}
