// app/parental/gate/page.tsx — pantalla PIN para entrar a zona padres
import Link from "next/link";
import { redirect } from "next/navigation";
import { cookies } from "next/headers";
import { requireUser } from "@/lib/auth";
import { PinForm } from "./PinForm";
import { PARENT_SESSION_COOKIE } from "../session";

export default async function ParentalGatePage() {
  const user = await requireUser();
  const c = await cookies();
  if (c.get(PARENT_SESSION_COOKIE)?.value === "1") redirect("/parental");

  const hasPin = !!user.parentalPin;

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-lilac-soft to-cream px-4 py-10">
      <Link href="/profile" className="absolute top-4 left-4 text-ink-soft text-sm font-bold">← Volver</Link>

      <div className="w-full max-w-sm bg-white rounded-3xl p-6 md:p-8 text-center" style={{ boxShadow: "var(--shadow-chunky)" }}>
        <div className="text-5xl mb-3">{hasPin ? "🔒" : "🔐"}</div>
        <div className="text-[10px] font-black text-lilac tracking-widest">ZONA DE PADRES</div>
        <h1 className="font-fredoka text-2xl font-bold text-ink mt-1">
          {hasPin ? "Ingresá tu PIN" : "Creá un PIN"}
        </h1>
        <p className="text-ink-soft text-sm font-bold mt-1 mb-5">
          {hasPin ? "4 dígitos para entrar" : "Para que los chicos no vean estadísticas ni ajustes"}
        </p>

        <PinForm mode={hasPin ? "verify" : "create"}/>
      </div>
    </div>
  );
}
