"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export function EnrollPathButton({
  childId,
  learningPathSlug,
  enrolled,
  isPremium = false,
  hasPremiumAccess = false,
}: {
  childId: string;
  learningPathSlug: string;
  enrolled: boolean;
  isPremium?: boolean;
  hasPremiumAccess?: boolean;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function enroll() {
    setError(null);
    start(async () => {
      const response = await fetch("/api/enrollments", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ childId, learningPathSlug }),
      });

      if (response.status === 402) {
        setError("premium_required");
        return;
      }

      if (!response.ok) {
        setError("No pudimos inscribirte. Prueba de nuevo.");
        return;
      }

      router.refresh();
    });
  }

  return (
    <div className="flex flex-col gap-2">
      <button
        type="button"
        onClick={enroll}
        disabled={pending}
        className="btn-chunky inline-flex items-center justify-center self-start rounded-full bg-ink px-4 py-2.5 text-xs font-black uppercase tracking-wide text-white disabled:opacity-50"
        style={{ boxShadow: "0 4px 0 rgba(0,0,0,0.25)" }}
      >
        {enrolled
          ? "Continuar"
          : isPremium && !hasPremiumAccess
            ? "Probar gratis"
            : "Empezar este camino"}
      </button>
      {error && (
        <div className="text-sm font-bold text-pink">
          {error === "premium_required" ? (
            <>
              Este camino es Premium.{" "}
              <Link href="/premium" className="underline">
                Ver activación
              </Link>
            </>
          ) : (
            error
          )}
        </div>
      )}
    </div>
  );
}
