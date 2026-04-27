// app/shop/page.tsx — server component con datos reales
import { redirect } from "next/navigation";
import { getActiveChild, getShopWithOwnership } from "@/lib/queries";
import { TopNav } from "@/components/TopNav";
import { Lumi } from "@/components/Lumi";
import { ShopClient } from "./ShopClient";

export default async function ShopPage() {
  const child = await getActiveChild();
  if (!child) redirect("/profile/create");

  const items = await getShopWithOwnership(child.id);

  return (
    <div className="min-h-[100dvh] flex flex-col bg-gradient-to-b from-lilac-soft to-cream md:bg-cream">
      <TopNav/>

      <main className="flex-1 w-full">
        <div className="max-w-5xl mx-auto px-4 md:px-8 py-6 md:py-10">
          <div className="mb-4 md:mb-6">
            <div className="text-[10px] md:text-xs font-black text-pink tracking-widest">🛍️ TIENDA DE LUMI</div>
            <h1 className="font-fredoka text-2xl md:text-3xl font-bold text-ink leading-tight">Tienda</h1>
          </div>
          <div className="md:grid md:grid-cols-[280px_1fr] md:gap-10">
          <aside className="md:sticky md:top-24 md:self-start text-center bg-white rounded-3xl p-6" style={{ boxShadow: "var(--shadow-chunky)" }}>
            <Lumi size={120} mood="celebrate"/>
            <div className="font-fredoka text-xl font-bold text-ink mt-2">{child.name}</div>
            <div className="text-xs font-bold text-ink-soft">¡Ponete algo lindo!</div>
          </aside>

          <ShopClient items={items} gems={child.gems}/>
          </div>
        </div>
      </main>
    </div>
  );
}
