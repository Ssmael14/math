// app/shop/page.tsx — server component con datos reales
import { redirect } from "next/navigation";
import Link from "next/link";
import { getActiveChild, getShopWithOwnership } from "@/lib/queries";
import { BottomNav } from "@/components/BottomNav";
import { Lumi } from "@/components/Lumi";
import { ShopClient } from "./ShopClient";

export default async function ShopPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const items = await getShopWithOwnership(child.id);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-lilac-soft to-cream md:bg-cream">
      <header className="sticky top-0 z-20 bg-white border-b border-ink/5">
        <div className="max-w-5xl mx-auto px-4 md:px-8 h-14 md:h-16 flex items-center justify-between gap-3">
          <Link href="/profile" className="w-9 h-9 rounded-xl bg-cream flex items-center justify-center font-bold text-ink" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>←</Link>
          <div className="text-[10px] md:text-xs font-black text-pink tracking-widest">🛍️ TIENDA DE LUMI</div>
          <div className="flex items-center gap-1 bg-cream rounded-full px-3 py-1.5">
            <span>💎</span><span className="font-black text-sm text-ink">{child.gems}</span>
          </div>
        </div>
      </header>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-4 md:py-8 pb-28 md:pb-12 md:grid md:grid-cols-[280px_1fr] md:gap-10">
          <aside className="md:sticky md:top-24 md:self-start text-center bg-white rounded-3xl p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <Lumi size={120} mood="celebrate"/>
            <div className="font-fredoka text-xl font-bold text-ink mt-2">{child.name}</div>
            <div className="text-xs font-bold text-ink-soft">¡Ponete algo lindo!</div>
          </aside>

          <ShopClient items={items} gems={child.gems}/>
        </div>
      </main>

      <div className="md:hidden"><BottomNav/></div>
    </div>
  );
}
