import Link from "next/link";
import { getActiveChild } from "@/lib/queries";
import { TopNavLinks } from "./TopNavLinks";

export async function TopNav() {
  const child = await getActiveChild();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink/5">
      <div className="safe-top">
        <div className="max-w-6xl mx-auto pl-3 pr-2 md:px-8 h-14 md:h-16 flex items-center gap-2 md:gap-6">
          <Link
            href="/home"
            className="flex items-center gap-1.5 font-fredoka font-bold text-ink whitespace-nowrap"
            aria-label="LearnMath"
          >
            <span className="text-2xl leading-none" aria-hidden>🦙</span>
            <span className="hidden md:inline text-xl">LearnMath</span>
          </Link>

          <TopNavLinks/>

          {child && (
            <div className="flex items-center gap-1 md:gap-1.5">
              <Stat icon="🔥" value={child.streak} label="Racha"/>
              <Stat icon="💎" value={child.gems} label="Gemas"/>
              <Stat icon="❤️" value={child.hearts} label="Vidas"/>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value, label }: { icon: string; value: number; label: string }) {
  return (
    <div
      className="flex items-center gap-1 bg-cream rounded-full px-2 md:px-2.5 py-1 md:py-1.5"
      aria-label={`${label}: ${value}`}
    >
      <span className="text-sm md:text-base leading-none" aria-hidden>{icon}</span>
      <span className="font-black text-xs md:text-sm text-ink tabular-nums">{value}</span>
    </div>
  );
}
