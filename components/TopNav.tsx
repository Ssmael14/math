import Link from "next/link";
import { Flame, Gem, Heart } from "lucide-react";
import { getActiveChild } from "@/lib/queries";
import { TopNavLinks } from "./TopNavLinks";

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
            <div className="flex items-center gap-3 md:gap-4">
              <Stat
                icon={<Flame className="w-[18px] h-[18px]" strokeWidth={2.2} fill="#FFC94A" stroke="#E8A500"/>}
                value={child.streak}
                label="Racha"
              />
              <Stat
                icon={<Heart className="w-[18px] h-[18px]" strokeWidth={2.2} fill="#FF5A78" stroke="#C93658"/>}
                value={child.hearts}
                label="Vidas"
                hideOnMobile
              />
              <Stat
                icon={<Gem className="w-[18px] h-[18px]" strokeWidth={2.2} fill="#6FBEE8" stroke="#3A8FBF"/>}
                value={child.gems}
                label="Gemas"
              />
            </div>
          )}
        </div>
      </div>
    </header>
  );
}

function Stat({
  icon,
  value,
  label,
  hideOnMobile,
}: {
  icon: React.ReactNode;
  value: number;
  label: string;
  hideOnMobile?: boolean;
}) {
  return (
    <div
      className={`flex items-center gap-1 ${hideOnMobile ? "hidden md:flex" : ""}`}
      aria-label={`${label}: ${value}`}
    >
      <span className="font-extrabold text-sm md:text-[15px] text-ink tabular-nums">{value}</span>
      {icon}
    </div>
  );
}
