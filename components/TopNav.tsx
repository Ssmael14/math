import Link from "next/link";
import { getActiveChild } from "@/lib/queries";
import { TopNavLinks } from "./TopNavLinks";
import { FlameIcon, GemIcon, HeartIcon } from "./icons";

export async function TopNav() {
  const child = await getActiveChild();

  return (
    <header className="sticky top-0 z-30 bg-white/95 backdrop-blur border-b border-ink/5">
      <div className="safe-top">
        <div className="max-w-6xl mx-auto px-3 md:px-8 h-14 md:h-16 flex items-center gap-2 md:gap-6">
          <Link
            href="/home"
            className="flex items-center gap-2 font-fredoka font-bold text-ink whitespace-nowrap"
            aria-label="LearnMath"
          >
            <span className="text-2xl leading-none" aria-hidden>🦙</span>
            <span className="hidden md:inline text-[19px] tracking-tight">LearnMath</span>
          </Link>

          <TopNavLinks/>

          {child && (
            <div className="flex items-center gap-2 md:gap-3">
              <Stat icon={<FlameIcon className="w-[18px] h-[18px]"/>} value={child.streak} label="Racha"/>
              <Stat icon={<GemIcon className="w-[18px] h-[18px]"/>} value={child.gems} label="Gemas"/>
              <Stat icon={<HeartIcon className="w-[18px] h-[18px]"/>} value={child.hearts} label="Vidas"/>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="flex items-center gap-1" aria-label={`${label}: ${value}`}>
      {icon}
      <span className="font-extrabold text-sm md:text-[15px] text-ink tabular-nums">{value}</span>
    </div>
  );
}
