// app/profile/select/SelectClient.tsx
"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Child } from "@prisma/client";

export function SelectClient({ children }: { children: Child[] }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function pick(childId: string) {
    start(async () => {
      await fetch("/api/children/select", { method: "POST", body: JSON.stringify({ childId }) });
      router.push("/home");
      router.refresh();
    });
  }

  return (
    <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
      {children.map((c) => (
        <button key={c.id} disabled={pending} onClick={() => pick(c.id)}
          className="btn-chunky bg-white rounded-3xl p-6 text-center disabled:opacity-50"
          style={{ boxShadow: "var(--shadow-chunky)" }}>
          <div className="text-6xl">{c.avatar}</div>
          <div className="font-fredoka text-xl font-bold text-ink mt-3">{c.name}</div>
          <div className="text-xs font-bold text-ink-soft">{c.age} años · Nv {c.level}</div>
          <div className="mt-2 flex items-center justify-center gap-2 text-xs font-bold">
            <span>🔥 {c.streak}</span><span>⭐ {c.xp}</span>
          </div>
        </button>
      ))}
    </div>
  );
}
