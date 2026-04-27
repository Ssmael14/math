"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { HomeIcon, BookIcon, TrophyIcon, BagIcon, UserIcon } from "./icons";

const items = [
  { href: "/home", label: "Inicio", Icon: HomeIcon },
  { href: "/units", label: "Cursos", Icon: BookIcon },
  { href: "/league", label: "Liga", Icon: TrophyIcon },
  { href: "/shop", label: "Tienda", Icon: BagIcon },
  { href: "/profile", label: "Perfil", Icon: UserIcon },
];

export function TopNavLinks() {
  const pathname = usePathname();

  return (
    <nav className="flex-1 min-w-0 flex items-center gap-0.5 md:gap-1 overflow-x-auto no-scrollbar">
      {items.map(({ href, label, Icon }) => {
        const active = pathname?.startsWith(href);
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={`relative flex items-center gap-2 px-2.5 md:px-3 h-11 md:h-12 whitespace-nowrap transition-colors ${
              active ? "text-ink" : "text-ink-mute hover:text-ink"
            }`}
          >
            <Icon className="w-5 h-5 md:w-[22px] md:h-[22px]" filled={active}/>
            <span className="hidden md:inline text-[15px] font-bold">{label}</span>
            {active && (
              <span className="absolute left-1.5 right-1.5 -bottom-px h-[3px] bg-ink rounded-full"/>
            )}
          </Link>
        );
      })}
    </nav>
  );
}
