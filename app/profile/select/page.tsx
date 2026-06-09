// app/profile/select/page.tsx — selector de niño
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireUser } from "@/lib/auth/server";
import { SelectClient } from "./SelectClient";

export default async function SelectChildPage() {
  const user = await requireUser();
  if (user.children.length === 0) redirect("/profile/create");

  return (
    <div className="min-h-[100dvh] flex flex-col items-center justify-center bg-gradient-to-b from-sky-soft via-white to-cream px-4 py-10">
      <div className="w-full max-w-2xl text-center">
        <div className="text-[10px] font-black text-sky tracking-widest mb-2">¿QUIÉN VA A JUGAR?</div>
        <h1 className="font-fredoka text-3xl md:text-4xl font-bold text-ink mb-8">Elige tu perfil</h1>

        <SelectClient children={user.children}/>

        <Link href="/profile/create" className="inline-block mt-8 text-sm font-bold text-sky underline">
          + Agregar otro hijo
        </Link>
      </div>
    </div>
  );
}
