"use client";
// app/paths/PathsClient.tsx
// Click → POST /api/enrollments + push al LearningPath canónico.
// Idempotente: si ya está enrolled, sólo updatea la cookie y sigue.

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

type Path = {
  id: string;
  slug: string;
  name: string;
  description: string | null;
  level: string;
  grade: number | null;
  isPremium: boolean;
  enrolled: boolean;
};

export function PathsClient({
  childId,
  paths,
}: {
  childId: string;
  paths: Path[];
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enroll(slug: string) {
    setError(null);
    start(async () => {
      const r = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childId, learningPathSlug: slug }),
      });
      if (r.status === 402) {
        setError("Este nivel es premium. Activá tu suscripción.");
        return;
      }
      if (!r.ok) {
        setError("No pudimos inscribirte. Probá de nuevo.");
        return;
      }
      router.push(`/paths/${slug}`);
      router.refresh();
    });
  }

  return (
    <>
      <div className="grid gap-3 md:gap-4 md:grid-cols-2">
        {paths.map((p) => (
          <button
            key={p.id}
            type="button"
            disabled={pending}
            onClick={() => enroll(p.slug)}
            className="btn-chunky text-left bg-white rounded-3xl p-5 md:p-6 border-4 border-white disabled:opacity-50 hover:border-sky"
            style={{ boxShadow: "var(--shadow-chunky)" }}
          >
            <div className="flex items-center justify-between mb-1">
              <div className="text-[10px] font-extrabold text-ink-mute tracking-widest">
                {p.level.toUpperCase()}
                {p.grade ? ` · ${p.grade}°` : ""}
              </div>
              {p.isPremium && (
                <span className="text-[10px] font-black bg-sun text-ink px-2 py-0.5 rounded-md">
                  PREMIUM
                </span>
              )}
            </div>
            <div className="font-fredoka font-bold text-lg md:text-xl text-ink">
              {p.name}
            </div>
            {p.description && (
              <div className="text-xs md:text-sm font-bold text-ink/70 mt-1">
                {p.description}
              </div>
            )}
            <div className="mt-3 flex items-center gap-2">
              {p.enrolled ? (
                <span className="text-[10px] font-black bg-mint text-white px-3 py-1.5 rounded-lg">
                  CONTINUAR
                </span>
              ) : (
                <span className="text-[10px] font-black bg-ink text-white px-3 py-1.5 rounded-lg">
                  EMPEZAR
                </span>
              )}
            </div>
          </button>
        ))}
      </div>

      {error && (
        <div className="mt-4 text-pink text-sm font-bold text-center">
          {error}
        </div>
      )}

      <div className="mt-6">
        <Link href="/subjects" className="text-sm font-bold text-sky underline">
          ← Cambiar de materia
        </Link>
      </div>
    </>
  );
}
