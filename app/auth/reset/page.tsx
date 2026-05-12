// app/auth/reset/page.tsx — definir nueva contraseña tras click en el link
// del email. Better Auth manda al user a /auth/reset?token=<firmado>.
"use client";
import Link from "next/link";
import { Suspense, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Lumi } from "@/components/Lumi";
import { resetPassword } from "@/lib/auth-client";

export default function ResetPage() {
  // useSearchParams requiere Suspense en App Router.
  return (
    <Suspense>
      <ResetForm />
    </Suspense>
  );
}

function ResetForm() {
  const router = useRouter();
  const sp = useSearchParams();
  const token = sp.get("token");
  const [pass, setPass] = useState("");
  const [pass2, setPass2] = useState("");
  const [err, setErr] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  async function save() {
    if (!token) {
      return setErr("Link inválido o expirado. Pedí uno nuevo desde 'Olvidé mi contraseña'.");
    }
    if (pass.length < 8) return setErr("Mínimo 8 caracteres");
    if (pass !== pass2) return setErr("Las contraseñas no coinciden");

    setLoading(true);
    setErr(null);
    const { error } = await resetPassword({ newPassword: pass, token });
    setLoading(false);
    if (error) {
      setErr(error.message ?? "No pudimos cambiar la contraseña.");
      return;
    }
    setDone(true);
    setTimeout(() => {
      router.push("/auth/login");
      router.refresh();
    }, 1500);
  }

  return (
    <div className="min-h-[100dvh] flex flex-col md:items-center md:justify-center bg-gradient-to-b from-mint-soft to-cream md:bg-cream">
      <Link
        href="/auth/login"
        className="absolute top-4 left-4 text-ink-soft text-sm font-bold z-10"
      >
        ← Volver
      </Link>

      <main className="flex-1 md:flex-none w-full max-w-md mx-auto px-6 pt-16 pb-6 md:py-12 flex flex-col">
        <div className="text-center mb-6">
          <Lumi size={80} mood={done ? "celebrate" : "happy"} />
          <h1 className="font-fredoka text-3xl font-bold text-ink mt-2">
            {done ? "¡Lista!" : "Nueva contraseña"}
          </h1>
          <p className="text-ink-soft text-sm font-bold mt-1">
            {done ? "Ya podés volver a entrar..." : "Elegí algo que te acuerdes 🔐"}
          </p>
        </div>

        {!done && (
          <div
            className="bg-white rounded-3xl p-6 md:p-8 space-y-3"
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Nueva contraseña"
              value={pass}
              onChange={(e) => setPass(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-mint outline-none transition"
            />
            <input
              type="password"
              autoComplete="new-password"
              placeholder="Repetir contraseña"
              value={pass2}
              onChange={(e) => setPass2(e.target.value)}
              className="w-full px-4 py-3.5 rounded-2xl border-2 border-cream bg-cream font-bold text-ink placeholder:text-ink-mute focus:border-mint outline-none transition"
            />
            {err && (
              <div className="text-pink text-xs font-bold text-center">{err}</div>
            )}
            <button
              onClick={save}
              disabled={loading || !pass || !pass2}
              className="btn-chunky w-full py-4 rounded-2xl bg-mint text-white font-fredoka text-lg font-bold disabled:opacity-50"
              style={{ boxShadow: "0 5px 0 #4DA86A" }}
            >
              {loading ? "Guardando..." : "Guardar contraseña"}
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
