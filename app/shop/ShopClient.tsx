// app/shop/ShopClient.tsx
"use client";
import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";

type Item = {
  id: string;
  slug: string;
  kind: "ACCESSORY" | "GEMS_PACK" | "HEARTS_REFILL";
  name: string;
  icon: string;
  price: number;
  rarity: "COMMON" | "RARE" | "EPIC" | "LEGENDARY";
  owned: boolean;
  equipped: boolean;
};

const RARITY_LABEL: Record<string, string> = {
  COMMON: "común", RARE: "rara", EPIC: "épica", LEGENDARY: "legendaria",
};

export function ShopClient({ items, gems }: { items: Item[]; gems: number }) {
  const [tab, setTab] = useState<"items" | "gems">("items");
  const [pending, start] = useTransition();
  const [msg, setMsg] = useState<string | null>(null);
  const router = useRouter();

  const accessories = items.filter((i) => i.kind === "ACCESSORY");
  const gemPacks = items.filter((i) => i.kind === "GEMS_PACK");

  function buy(itemId: string) {
    start(async () => {
      const r = await fetch("/api/shop/buy", { method: "POST", body: JSON.stringify({ itemId }) });
      const j = await r.json();
      if (j.ok) { setMsg("¡Comprado! 🎉"); router.refresh(); }
      else if (j.error === "not enough gems") setMsg("Te faltan gemas 💎");
      else setMsg(j.error || "Error");
      setTimeout(() => setMsg(null), 2000);
    });
  }

  function equip(itemId: string) {
    start(async () => {
      await fetch("/api/shop/equip", { method: "POST", body: JSON.stringify({ itemId }) });
      router.refresh();
    });
  }

  return (
    <section className="mt-6 md:mt-0">
      <div className="flex gap-2 mb-4">
        <button onClick={() => setTab("items")} className={`flex-1 py-2 rounded-xl font-bold text-sm ${tab === "items" ? "bg-ink text-white" : "bg-white text-ink"}`} style={{ boxShadow: "var(--shadow-chunky-sm)" }}>Accesorios</button>
        <button onClick={() => setTab("gems")} className={`flex-1 py-2 rounded-xl font-bold text-sm ${tab === "gems" ? "bg-ink text-white" : "bg-white text-ink"}`} style={{ boxShadow: "var(--shadow-chunky-sm)" }}>Comprar gemas</button>
      </div>

      {msg && <div className="mb-3 text-center text-sm font-bold text-mint">{msg}</div>}

      {tab === "items" ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {accessories.map((it) => (
            <div key={it.id} className="bg-white rounded-2xl p-4 text-center" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              <div className="text-5xl">{it.icon}</div>
              <div className="font-fredoka font-bold text-ink mt-1">{it.name}</div>
              <div className="text-[10px] font-bold text-ink-mute uppercase">{RARITY_LABEL[it.rarity]}</div>
              {it.owned ? (
                <button disabled={pending} onClick={() => equip(it.id)} className="btn-chunky mt-2 w-full py-2 rounded-xl bg-sky text-white font-bold" style={{ boxShadow: "0 3px 0 #2445D8" }}>
                  {it.equipped ? "✓ En uso" : "Usar"}
                </button>
              ) : (
                <button disabled={pending || gems < it.price} onClick={() => buy(it.id)} className="btn-chunky mt-2 w-full py-2 rounded-xl bg-sun text-ink font-bold flex items-center justify-center gap-1 disabled:opacity-50" style={{ boxShadow: "0 3px 0 #D99A00" }}>
                  💎 {it.price}
                </button>
              )}
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {gemPacks.map((p, i) => (
            <div key={p.id} className="bg-white rounded-2xl p-4 text-center relative" style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
              {i === 1 && <div className="absolute -top-2 left-1/2 -translate-x-1/2 bg-pink text-white text-[10px] font-black px-2 py-0.5 rounded-full">MÁS POPULAR</div>}
              <div className="text-3xl">{p.icon}</div>
              <div className="font-fredoka text-2xl font-bold text-ink mt-1">{p.name}</div>
              <button className="btn-chunky mt-2 w-full py-2 rounded-xl bg-sky text-white font-bold" style={{ boxShadow: "0 3px 0 #2445D8" }}>
                ${(p.price / 100).toFixed(2)}
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
