// app/offline/page.tsx — fallback que muestra el service worker cuando el
// niño está sin conexión y la URL pedida no está en cache.
import Link from "next/link";
import { brand } from "@/lib/brand";

export const dynamic = "force-static";

export default function OfflinePage() {
  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-cream px-6 py-8 text-center">
      <div className="text-7xl mb-4">📡</div>
      <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mb-2">Sin internet</h1>
      <p className="text-ink-soft max-w-sm mb-6">
        {brand.mascotName} necesita conexión para cargar lecciones nuevas. Tus respuestas
        de hoy se van a guardar y subir cuando vuelva el wifi.
      </p>
      <Link
        href="/home"
        className="btn-chunky py-3 px-8 rounded-full bg-ink text-white font-black uppercase tracking-wide text-sm"
        style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.25)" }}
      >
        Reintentar
      </Link>
    </div>
  );
}
