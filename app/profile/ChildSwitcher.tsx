// app/profile/ChildSwitcher.tsx
"use client";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import type { Child } from "@prisma/client";

export function ChildSwitcher({ children, activeId }: { children: Child[]; activeId: string }) {
  const router = useRouter();
  const [pending, start] = useTransition();

  function pick(childId: string) {
    if (childId === activeId) return;
    start(async () => {
      await fetch("/api/children/select", { method: "POST", body: JSON.stringify({ childId }) });
      router.refresh();
    });
  }

  return (
    <div className="flex gap-2 flex-wrap">
      {children.map((c) => (
        <button key={c.id} disabled={pending} onClick={() => pick(c.id)}
          className={`flex items-center gap-2 px-3 py-2 rounded-2xl font-bold text-sm border-2 ${
            c.id === activeId ? "bg-sun border-sun-deep text-ink" : "bg-white border-white text-ink-soft"
          } disabled:opacity-50`}
          style={{ boxShadow: "var(--shadow-chunky-sm)" }}>
          <span className="text-xl">{c.avatar}</span>
          <span>{c.name}</span>
        </button>
      ))}
    </div>
  );
}
